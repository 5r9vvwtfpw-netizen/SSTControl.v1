import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, differenceInDays, addDays } from "date-fns";
import { es } from "date-fns/locale";
import type { 
  AccidentInvestigation, 
  InvestigationParticipant, 
  InvestigationFinding, 
  Accident, 
  Worker,
  CopasstMiembro,
  CopasstActa,
  ResponsibleDesignation
} from "@shared/schema";

type CopasstPeriodo = {
  id: string;
  companyId: string;
  periodoInicio: string;
  periodoFin: string;
  estado: string;
};

const COPASST_ROLES = [
  { value: "presidente", label: "Presidente" },
  { value: "vicepresidente", label: "Vicepresidente" },
  { value: "secretario", label: "Secretario" },
  { value: "representante_trabajadores", label: "Representante Trabajadores" },
  { value: "representante_empleador", label: "Representante Empleador" },
  { value: "suplente_trabajadores", label: "Suplente Trabajadores" },
  { value: "suplente_empleador", label: "Suplente Empleador" },
];

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { 
  Search, 
  Plus, 
  FileText, 
  ChevronDown, 
  ChevronUp, 
  Edit, 
  Trash2, 
  Download, 
  UserPlus, 
  ClipboardPlus,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  Users,
  Shield,
  FileCheck,
  Calendar,
  Loader2,
  Filter,
  BarChart3,
  CalendarDays
} from "lucide-react";
import { BackToEvaluationButton } from "@/components/BackToEvaluationButton";
import { BackToCronogramaButton } from "@/components/BackToCronogramaButton";

const EVENT_TYPES = [
  { value: "accidente_trabajo", label: "Accidente de Trabajo" },
  { value: "incidente", label: "Incidente" },
  { value: "enfermedad_laboral", label: "Enfermedad Laboral" },
];

const ANALYSIS_METHODOLOGIES = [
  { value: "arbol_causas", label: "Árbol de Causas" },
  { value: "5_porques", label: "5 Porqués" },
  { value: "espina_pescado", label: "Espina de Pescado (Ishikawa)" },
];

const INVESTIGATION_STATUS = [
  { value: "pendiente", label: "Pendiente", color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200" },
  { value: "en_proceso", label: "En Proceso", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
  { value: "completada", label: "Completada", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
  { value: "remitida", label: "Remitida al Ministerio", color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200" },
  { value: "cerrada", label: "Cerrada", color: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200" },
];

const SLA_STATUS = [
  { value: "en_tiempo", label: "En Tiempo", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200", icon: CheckCircle },
  { value: "proximo_vencer", label: "Próximo a Vencer", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200", icon: Clock },
  { value: "vencido", label: "Vencido", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200", icon: XCircle },
];

const PARTICIPANT_ROLES = [
  { value: "investigador_lider", label: "Investigador Líder" },
  { value: "copasst", label: "Miembro COPASST/Vigía" },
  { value: "profesional_sst", label: "Profesional SST con Licencia" },
  { value: "testigo", label: "Testigo" },
  { value: "jefe_inmediato", label: "Jefe Inmediato" },
  { value: "trabajador_afectado", label: "Trabajador Afectado" },
  { value: "brigadista", label: "Brigadista" },
  { value: "otro", label: "Otro" },
];

const FINDING_TYPES = [
  { value: "inmediata_acto", label: "Causa Inmediata - Acto Inseguro" },
  { value: "inmediata_condicion", label: "Causa Inmediata - Condición Insegura" },
  { value: "basica_personal", label: "Causa Básica - Factor Personal" },
  { value: "basica_trabajo", label: "Causa Básica - Factor del Trabajo" },
  { value: "raiz", label: "Causa Raíz" },
];

const FINDING_STATUS = [
  { value: "pendiente", label: "Pendiente", color: "bg-gray-100 text-gray-800" },
  { value: "en_proceso", label: "En Proceso", color: "bg-blue-100 text-blue-800" },
  { value: "completada", label: "Completada", color: "bg-green-100 text-green-800" },
  { value: "verificada", label: "Verificada", color: "bg-emerald-100 text-emerald-800" },
];

const IMMEDIATE_CAUSES_OPTIONS = [
  { value: "operar_sin_autorizacion", label: "Operar sin autorización" },
  { value: "no_uso_epp", label: "No usar equipo de protección personal" },
  { value: "velocidad_inadecuada", label: "Velocidad inadecuada" },
  { value: "no_seguir_procedimiento", label: "No seguir procedimiento establecido" },
  { value: "posicion_inadecuada", label: "Posición inadecuada para la tarea" },
  { value: "levantar_peso_incorrecto", label: "Levantamiento incorrecto de cargas" },
  { value: "distraccion", label: "Distracción durante la tarea" },
  { value: "fatiga", label: "Fatiga del trabajador" },
];

const CONDITION_CAUSES_OPTIONS = [
  { value: "proteccion_inadecuada", label: "Protecciones inadecuadas o inexistentes" },
  { value: "herramienta_defectuosa", label: "Herramientas o equipos defectuosos" },
  { value: "orden_limpieza", label: "Falta de orden y limpieza" },
  { value: "iluminacion_deficiente", label: "Iluminación deficiente" },
  { value: "ventilacion_inadecuada", label: "Ventilación inadecuada" },
  { value: "espacio_reducido", label: "Espacio de trabajo reducido" },
  { value: "senalizacion_deficiente", label: "Señalización deficiente o inexistente" },
  { value: "piso_resbaloso", label: "Piso resbaloso o en mal estado" },
];

const BASIC_PERSONAL_CAUSES = [
  { value: "falta_conocimiento", label: "Falta de conocimiento o capacitación" },
  { value: "falta_habilidad", label: "Falta de habilidad para la tarea" },
  { value: "motivacion_inadecuada", label: "Motivación inadecuada" },
  { value: "estres_tension", label: "Estrés o tensión" },
  { value: "problemas_salud", label: "Problemas de salud física o mental" },
  { value: "fatiga_cansancio", label: "Fatiga o cansancio" },
];

const BASIC_WORK_CAUSES = [
  { value: "supervision_inadecuada", label: "Supervisión inadecuada" },
  { value: "liderazgo_deficiente", label: "Liderazgo deficiente" },
  { value: "ingenieria_inadecuada", label: "Ingeniería inadecuada" },
  { value: "herramientas_inadecuadas", label: "Herramientas o equipos inadecuados" },
  { value: "mantenimiento_deficiente", label: "Mantenimiento deficiente" },
  { value: "comunicacion_deficiente", label: "Comunicación deficiente" },
  { value: "procedimientos_ausentes", label: "Procedimientos ausentes o inadecuados" },
];

const investigationFormSchema = z.object({
  accidentId: z.string().min(1, "Por favor seleccione el accidente o incidente que desea investigar de la lista disponible"),
  eventType: z.string().min(1, "Por favor seleccione el tipo de evento: Accidente de Trabajo, Incidente o Enfermedad Laboral"),
  eventDate: z.string().min(1, "Por favor ingrese la fecha en que ocurrió el evento (formato: día/mes/año)"),
  investigationStartDate: z.string().min(1, "Por favor ingrese la fecha en que inicia la investigación (formato: día/mes/año)"),
  eventDescription: z.string().min(10, "Por favor describa detalladamente el evento. La descripción debe tener al menos 10 caracteres para ser válida"),
  analysisMethodology: z.string().min(1, "Por favor seleccione la metodología de análisis: Árbol de Causas, 5 Porqués o Espina de Pescado"),
  isSevere: z.boolean().default(false),
  isFatal: z.boolean().default(false),
  copasstParticipation: z.boolean().default(false),
  copasstMemberName: z.string().optional(),
  copasstMemberRole: z.string().optional(),
  copasstActNumber: z.string().optional(),
  licensedProfessionalName: z.string().optional(),
  licensedProfessionalDocument: z.string().optional(),
  licensedProfessionalLicense: z.string().optional(),
  licensedProfessionalLicenseExpiry: z.string().optional(),
  immediateActCauses: z.array(z.string()).optional(),
  immediateConditionCauses: z.array(z.string()).optional(),
  basicPersonalCauses: z.array(z.string()).optional(),
  basicWorkCauses: z.array(z.string()).optional(),
  rootCause: z.string().optional(),
  conclusions: z.string().optional(),
  lessonLearned: z.string().optional(),
  injuredWorkerStatement: z.string().optional(),
  witnessStatements: z.string().optional(),
});

type InvestigationFormData = z.infer<typeof investigationFormSchema>;

const participantFormSchema = z.object({
  participantName: z.string().min(1, "Por favor ingrese el nombre completo del participante de la investigación"),
  participantDocument: z.string().optional(),
  participantRole: z.string().min(1, "Por favor seleccione el rol del participante: Investigador Líder, Miembro COPASST, Profesional SST, Testigo, etc."),
  participantPosition: z.string().optional(),
  participantArea: z.string().optional(),
  hasLicense: z.boolean().default(false),
  licenseNumber: z.string().optional(),
  licenseExpiry: z.string().optional(),
  participationDate: z.string().optional(),
  observations: z.string().optional(),
});

type ParticipantFormData = z.infer<typeof participantFormSchema>;

const findingFormSchema = z.object({
  findingType: z.string().min(1, "Por favor seleccione el tipo de hallazgo: Causa Inmediata (Acto/Condición), Causa Básica o Causa Raíz"),
  description: z.string().min(5, "Por favor describa el hallazgo identificado. La descripción debe tener al menos 5 caracteres"),
  correctiveAction: z.string().min(5, "Por favor describa la acción correctiva propuesta. La descripción debe tener al menos 5 caracteres"),
  responsibleName: z.string().min(1, "Por favor ingrese el nombre del responsable de implementar la acción correctiva"),
  responsibleArea: z.string().optional(),
  dueDate: z.string().min(1, "Por favor seleccione la fecha límite para implementar la acción correctiva"),
});

type FindingFormData = z.infer<typeof findingFormSchema>;

function getSlaStatusInfo(status: string) {
  return SLA_STATUS.find(s => s.value === status) || SLA_STATUS[0];
}

function getStatusBadge(status: string) {
  const s = INVESTIGATION_STATUS.find(st => st.value === status);
  return s ? <Badge className={s.color}>{s.label}</Badge> : <Badge>{status}</Badge>;
}

function getEventTypeLabel(type: string) {
  return EVENT_TYPES.find(e => e.value === type)?.label || type;
}

function calculateSlaStatus(dueDate: string): { status: string; daysRemaining: number } {
  const due = new Date(dueDate);
  const today = new Date();
  const daysRemaining = differenceInDays(due, today);
  
  if (daysRemaining < 0) return { status: "vencido", daysRemaining };
  if (daysRemaining <= 3) return { status: "proximo_vencer", daysRemaining };
  return { status: "en_tiempo", daysRemaining };
}

export default function InvestigacionAccidentes() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [slaFilter, setSlaFilter] = useState<string>("todos");
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingInvestigation, setEditingInvestigation] = useState<AccidentInvestigation | null>(null);
  const [participantDialogOpen, setParticipantDialogOpen] = useState(false);
  const [findingDialogOpen, setFindingDialogOpen] = useState(false);
  const [selectedInvestigationId, setSelectedInvestigationId] = useState<string | null>(null);

  const form = useForm<InvestigationFormData>({
    resolver: zodResolver(investigationFormSchema),
    defaultValues: {
      accidentId: "",
      eventType: "accidente_trabajo",
      eventDate: "",
      investigationStartDate: format(new Date(), "yyyy-MM-dd"),
      eventDescription: "",
      analysisMethodology: "arbol_causas",
      isSevere: false,
      isFatal: false,
      copasstParticipation: false,
      copasstMemberName: "",
      copasstMemberRole: "",
      copasstActNumber: "",
      licensedProfessionalName: "",
      licensedProfessionalDocument: "",
      licensedProfessionalLicense: "",
      licensedProfessionalLicenseExpiry: "",
      immediateActCauses: [],
      immediateConditionCauses: [],
      basicPersonalCauses: [],
      basicWorkCauses: [],
      rootCause: "",
      conclusions: "",
      lessonLearned: "",
      injuredWorkerStatement: "",
      witnessStatements: "",
    },
  });

  const participantForm = useForm<ParticipantFormData>({
    resolver: zodResolver(participantFormSchema),
    defaultValues: {
      participantName: "",
      participantDocument: "",
      participantRole: "",
      participantPosition: "",
      participantArea: "",
      hasLicense: false,
      licenseNumber: "",
      licenseExpiry: "",
      participationDate: format(new Date(), "yyyy-MM-dd"),
      observations: "",
    },
  });

  const findingForm = useForm<FindingFormData>({
    resolver: zodResolver(findingFormSchema),
    defaultValues: {
      findingType: "",
      description: "",
      correctiveAction: "",
      responsibleName: "",
      responsibleArea: "",
      dueDate: "",
    },
  });

  const { data: investigations = [], isLoading: loadingInvestigations } = useQuery<AccidentInvestigation[]>({
    queryKey: ["/api/investigations"],
  });

  const { data: accidents = [] } = useQuery<Accident[]>({
    queryKey: ["/api/accidents"],
  });

  const { data: workers = [] } = useQuery<Worker[]>({
    queryKey: ["/api/workers"],
  });

  // Queries para COPASST - miembros y actas
  const { data: periodoActivo } = useQuery<CopasstPeriodo>({
    queryKey: ["/api/copasst-periodos/activo"],
    queryFn: async () => {
      const res = await fetch("/api/copasst-periodos/activo");
      if (!res.ok) return null;
      return res.json();
    },
  });

  const { data: copasstMiembros = [] } = useQuery<CopasstMiembro[]>({
    queryKey: ["/api/copasst-miembros", periodoActivo?.id],
    queryFn: async () => {
      if (!periodoActivo?.id) return [];
      const res = await fetch(`/api/copasst-miembros/${periodoActivo.id}`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!periodoActivo?.id,
  });

  const { data: copasstActas = [] } = useQuery<CopasstActa[]>({
    queryKey: ["/api/copasst-actas"],
  });

  // Query para responsables SST designados (con licencia)
  const { data: responsibleDesignations = [] } = useQuery<ResponsibleDesignation[]>({
    queryKey: ["/api/responsible-designations"],
  });

  // Query para LSOs asignados a la empresa (profesionales externos del directorio)
  // Uses dedicated endpoint that only requires authentication (no special permissions)
  const { data: assignedLSOs = [] } = useQuery<any[]>({
    queryKey: ["/api/company/assigned-sst-professionals"],
    enabled: !!user?.companyId,
  });

  // Filtrar solo responsables activos con licencia SST (internos)
  const sstResponsiblesInternal = responsibleDesignations.filter(r => 
    r.status === "activo" && r.licenciaSstNumero
  );
  
  // Combinar LSOs externos asignados con responsables internos
  const sstResponsibles = [
    // LSOs externos asignados desde el directorio
    ...assignedLSOs.filter(lso => lso.sstLicenseStatus === 'vigente').map(lso => ({
      id: `lso_${lso.id}`,
      workerId: lso.id,
      position: lso.sstProfessionType === 'medico_ocupacional' ? 'Médico Ocupacional' :
                lso.sstProfessionType === 'profesional_sst' ? 'Profesional SST' :
                lso.sstProfessionType === 'tecnologo_sst' ? 'Tecnólogo SST' :
                lso.sstProfessionType === 'tecnico_sst' ? 'Técnico SST' : 'LSO',
      status: "activo",
      licenciaSstNumero: lso.sstLicenseNumber,
      licenciaSstVigencia: lso.sstLicenseExpiry,
      documento: lso.email,
      isExternalLSO: true,
      fullName: lso.fullName || lso.username,
    })),
    // Responsables internos con licencia
    ...sstResponsiblesInternal.map(r => ({
      ...r,
      isExternalLSO: false,
    })),
  ];

  const createInvestigationMutation = useMutation({
    mutationFn: async (data: InvestigationFormData) => {
      const eventDate = new Date(data.eventDate);
      const dueDate = addDays(eventDate, 15);
      const slaInfo = calculateSlaStatus(format(dueDate, "yyyy-MM-dd"));
      
      const payload = {
        ...data,
        dueDate: format(dueDate, "yyyy-MM-dd"),
        slaStatus: slaInfo.status,
        daysRemaining: slaInfo.daysRemaining,
        requiresLicensedProfessional: data.isSevere || data.isFatal ? 1 : 0,
        requiresMinistryReport: data.isFatal ? 1 : 0,
        isSevere: data.isSevere ? 1 : 0,
        isFatal: data.isFatal ? 1 : 0,
        copasstParticipation: data.copasstParticipation ? 1 : 0,
        status: "en_proceso",
        completionPercentage: 10,
      };
      const res = await apiRequest("POST", "/api/investigations", payload);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/investigations"] });
      setDialogOpen(false);
      form.reset();
      toast({
        title: "Investigación creada",
        description: "La investigación se ha registrado exitosamente",
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

  const updateInvestigationMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InvestigationFormData> }) => {
      const res = await apiRequest("PATCH", `/api/investigations/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/investigations"] });
      setDialogOpen(false);
      setEditingInvestigation(null);
      form.reset();
      toast({
        title: "Investigación actualizada",
        description: "Los cambios se han guardado exitosamente",
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

  const deleteInvestigationMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/investigations/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/investigations"] });
      toast({
        title: "Investigación eliminada",
        description: "La investigación se ha eliminado exitosamente",
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

  const createParticipantMutation = useMutation({
    mutationFn: async (data: ParticipantFormData & { investigationId: string }) => {
      const { investigationId, ...rest } = data;
      const payload = {
        ...rest,
        hasLicense: data.hasLicense ? 1 : 0,
        licenseVerified: 0,
      };
      const res = await apiRequest("POST", `/api/investigations/${investigationId}/participants`, payload);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/investigations"] });
      setParticipantDialogOpen(false);
      participantForm.reset();
      toast({
        title: "Participante agregado",
        description: "El participante se ha registrado exitosamente",
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

  const createFindingMutation = useMutation({
    mutationFn: async (data: FindingFormData & { investigationId: string }) => {
      const { investigationId, ...rest } = data;
      const res = await apiRequest("POST", `/api/investigations/${investigationId}/findings`, rest);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/investigations"] });
      setFindingDialogOpen(false);
      findingForm.reset();
      toast({
        title: "Hallazgo agregado",
        description: "El hallazgo se ha registrado exitosamente",
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

  const handleSubmit = (data: InvestigationFormData) => {
    if (editingInvestigation) {
      updateInvestigationMutation.mutate({ id: editingInvestigation.id, data });
    } else {
      createInvestigationMutation.mutate(data);
    }
  };

  const handleAddParticipant = (data: ParticipantFormData) => {
    if (selectedInvestigationId) {
      createParticipantMutation.mutate({ ...data, investigationId: selectedInvestigationId });
    }
  };

  const handleAddFinding = (data: FindingFormData) => {
    if (selectedInvestigationId) {
      createFindingMutation.mutate({ ...data, investigationId: selectedInvestigationId });
    }
  };

  const handleEdit = (investigation: AccidentInvestigation) => {
    setEditingInvestigation(investigation);
    form.reset({
      accidentId: investigation.accidentId,
      eventType: investigation.eventType,
      eventDate: investigation.eventDate,
      investigationStartDate: investigation.investigationStartDate,
      eventDescription: investigation.eventDescription,
      analysisMethodology: investigation.analysisMethodology,
      isSevere: investigation.isSevere === 1,
      isFatal: investigation.isFatal === 1,
      copasstParticipation: investigation.copasstParticipation === 1,
      copasstMemberName: investigation.copasstMemberName || "",
      copasstMemberRole: investigation.copasstMemberRole || "",
      copasstActNumber: investigation.copasstActNumber || "",
      licensedProfessionalName: investigation.licensedProfessionalName || "",
      licensedProfessionalDocument: investigation.licensedProfessionalDocument || "",
      licensedProfessionalLicense: investigation.licensedProfessionalLicense || "",
      licensedProfessionalLicenseExpiry: investigation.licensedProfessionalLicenseExpiry || "",
      immediateActCauses: investigation.immediateActCauses || [],
      immediateConditionCauses: investigation.immediateConditionCauses || [],
      basicPersonalCauses: investigation.basicPersonalCauses || [],
      basicWorkCauses: investigation.basicWorkCauses || [],
      rootCause: investigation.rootCause || "",
      conclusions: investigation.conclusions || "",
      lessonLearned: investigation.lessonLearned || "",
      injuredWorkerStatement: investigation.injuredWorkerStatement || "",
      witnessStatements: investigation.witnessStatements || "",
    });
    setDialogOpen(true);
  };

  const toggleCardExpanded = (id: string) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const openParticipantDialog = (investigationId: string) => {
    setSelectedInvestigationId(investigationId);
    setParticipantDialogOpen(true);
  };

  const openFindingDialog = (investigationId: string) => {
    setSelectedInvestigationId(investigationId);
    setFindingDialogOpen(true);
  };

  const getWorkerName = (workerId: string | undefined) => {
    if (!workerId) return "N/A";
    const worker = workers.find(w => w.id === workerId);
    return worker?.name || "N/A";
  };

  const getAccidentInfo = (accidentId: string) => {
    return accidents.find(a => a.id === accidentId);
  };

  const getInvestigationParticipants = (investigation: AccidentInvestigation) => {
    return (investigation as any).participants || [];
  };

  const getInvestigationFindings = (investigation: AccidentInvestigation) => {
    return (investigation as any).findings || [];
  };

  const filteredInvestigations = investigations.filter(inv => {
    const accident = getAccidentInfo(inv.accidentId);
    const workerName = accident ? getWorkerName(accident.workerId) : "";
    
    const matchesSearch = 
      workerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.eventDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getEventTypeLabel(inv.eventType).toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "todos" || inv.status === statusFilter;
    const matchesSla = slaFilter === "todos" || inv.slaStatus === slaFilter;
    
    return matchesSearch && matchesStatus && matchesSla;
  });

  const stats = {
    total: investigations.length,
    pendientes: investigations.filter(i => i.status === "pendiente" || i.status === "en_proceso").length,
    completadas: investigations.filter(i => i.status === "completada" || i.status === "cerrada").length,
    vencidas: investigations.filter(i => i.slaStatus === "vencido").length,
    cumplimiento: investigations.length > 0 
      ? Math.round((investigations.filter(i => i.slaStatus !== "vencido").length / investigations.length) * 100) 
      : 100,
  };

  const isSevereOrFatal = form.watch("isSevere") || form.watch("isFatal");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <BackToEvaluationButton />
        <BackToCronogramaButton />
      </div>
      
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Investigación de Accidentes</h1>
          <p className="text-muted-foreground">
            Estándar 3.2.1 - Resolución 0312/2019, Resolución 1401/2007
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            data-testid="button-export-pdf"
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar PDF
          </Button>
          <Button
            onClick={() => {
              setEditingInvestigation(null);
              form.reset();
              setDialogOpen(true);
            }}
            data-testid="button-new-investigation"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nueva Investigación
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold" data-testid="stat-total">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total Investigaciones</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold" data-testid="stat-pending">{stats.pendientes}</p>
                <p className="text-xs text-muted-foreground">En Proceso</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold" data-testid="stat-completed">{stats.completadas}</p>
                <p className="text-xs text-muted-foreground">Completadas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-2xl font-bold" data-testid="stat-overdue">{stats.vencidas}</p>
                <p className="text-xs text-muted-foreground">Vencidas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold" data-testid="stat-compliance">{stats.cumplimiento}%</p>
                <p className="text-xs text-muted-foreground">Cumplimiento SLA</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <CardTitle className="text-lg">Filtros</CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar investigación..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                  data-testid="input-search"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40" data-testid="select-status-filter">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los estados</SelectItem>
                  {INVESTIGATION_STATUS.map(s => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={slaFilter} onValueChange={setSlaFilter}>
                <SelectTrigger className="w-40" data-testid="select-sla-filter">
                  <Clock className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="SLA" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los SLA</SelectItem>
                  {SLA_STATUS.map(s => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {loadingInvestigations ? (
        <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredInvestigations.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-8">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No hay investigaciones registradas</h3>
            <p className="text-muted-foreground text-center mt-2">
              Cree una nueva investigación para comenzar el seguimiento de accidentes según la Resolución 1401/2007.
            </p>
            {accidents.length === 0 && (
              <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg">
                <p className="text-amber-800 dark:text-amber-200 text-sm text-center mb-3">
                  Primero debe registrar accidentes en el módulo de Accidentes para poder crear investigaciones.
                </p>
                <div className="flex justify-center">
                  <Link href="/accidentes">
                    <Button variant="outline" className="gap-2" data-testid="button-go-to-accidents">
                      <Plus className="h-4 w-4" />
                      Ir a Registrar Accidentes
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredInvestigations.map((investigation) => {
            const accident = getAccidentInfo(investigation.accidentId);
            const workerName = accident ? getWorkerName(accident.workerId) : "N/A";
            const isExpanded = expandedCards.has(investigation.id);
            const slaInfo = getSlaStatusInfo(investigation.slaStatus);
            const SlaIcon = slaInfo.icon;
            const invParticipants = getInvestigationParticipants(investigation);
            const invFindings = getInvestigationFindings(investigation);

            return (
              <Collapsible key={investigation.id} open={isExpanded} onOpenChange={() => toggleCardExpanded(investigation.id)}>
                <Card className="overflow-hidden" data-testid={`card-investigation-${investigation.id}`}>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover-elevate">
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="font-medium">
                                {getEventTypeLabel(investigation.eventType)}
                              </Badge>
                              {investigation.isSevere === 1 && (
                                <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                                  Grave
                                </Badge>
                              )}
                              {investigation.isFatal === 1 && (
                                <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                                  Mortal
                                </Badge>
                              )}
                            </div>
                            <h3 className="font-semibold" data-testid={`text-worker-name-${investigation.id}`}>
                              {workerName}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Fecha evento: {format(new Date(investigation.eventDate), "dd/MM/yyyy", { locale: es })}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="flex flex-col items-end gap-1">
                            <Badge className={slaInfo.color} data-testid={`badge-sla-${investigation.id}`}>
                              <SlaIcon className="h-3 w-3 mr-1" />
                              {slaInfo.label}
                              {investigation.daysRemaining !== null && (
                                <span className="ml-1">({investigation.daysRemaining}d)</span>
                              )}
                            </Badge>
                            {getStatusBadge(investigation.status)}
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <div className="w-24">
                              <Progress value={investigation.completionPercentage} className="h-2" />
                              <p className="text-xs text-muted-foreground text-center mt-1">
                                {investigation.completionPercentage}%
                              </p>
                            </div>
                            {isExpanded ? (
                              <ChevronUp className="h-5 w-5 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      <Separator className="mb-4" />
                      
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium text-sm text-muted-foreground mb-2">Descripción del Evento</h4>
                            <p className="text-sm">{investigation.eventDescription}</p>
                          </div>
                          
                          <div>
                            <h4 className="font-medium text-sm text-muted-foreground mb-2">Metodología de Análisis</h4>
                            <Badge variant="outline">
                              {ANALYSIS_METHODOLOGIES.find(m => m.value === investigation.analysisMethodology)?.label || investigation.analysisMethodology}
                            </Badge>
                          </div>

                          {investigation.copasstParticipation === 1 && (
                            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                              <div className="flex items-center gap-2 mb-2">
                                <Shield className="h-4 w-4 text-green-600" />
                                <h4 className="font-medium text-sm text-green-800 dark:text-green-200">Participación COPASST</h4>
                              </div>
                              <p className="text-sm text-green-700 dark:text-green-300">
                                {investigation.copasstMemberName} - {investigation.copasstMemberRole}
                              </p>
                              {investigation.copasstActNumber && (
                                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                                  Acta No. {investigation.copasstActNumber}
                                </p>
                              )}
                            </div>
                          )}

                          {(investigation.isSevere === 1 || investigation.isFatal === 1) && investigation.licensedProfessionalName && (
                            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                              <div className="flex items-center gap-2 mb-2">
                                <FileCheck className="h-4 w-4 text-blue-600" />
                                <h4 className="font-medium text-sm text-blue-800 dark:text-blue-200">Profesional SST con Licencia</h4>
                              </div>
                              <p className="text-sm text-blue-700 dark:text-blue-300">
                                {investigation.licensedProfessionalName}
                              </p>
                              <p className="text-xs text-blue-600 dark:text-blue-400">
                                Licencia: {investigation.licensedProfessionalLicense}
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium text-sm text-muted-foreground mb-2">Causas Identificadas</h4>
                            <div className="space-y-2">
                              {investigation.immediateActCauses && investigation.immediateActCauses.length > 0 && (
                                <div>
                                  <span className="text-xs font-medium text-orange-600">Actos Inseguros:</span>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {investigation.immediateActCauses.map((cause, idx) => (
                                      <Badge key={idx} variant="outline" className="text-xs">
                                        {IMMEDIATE_CAUSES_OPTIONS.find(c => c.value === cause)?.label || cause}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {investigation.immediateConditionCauses && investigation.immediateConditionCauses.length > 0 && (
                                <div>
                                  <span className="text-xs font-medium text-yellow-600">Condiciones Inseguras:</span>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {investigation.immediateConditionCauses.map((cause, idx) => (
                                      <Badge key={idx} variant="outline" className="text-xs">
                                        {CONDITION_CAUSES_OPTIONS.find(c => c.value === cause)?.label || cause}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {investigation.rootCause && (
                                <div>
                                  <span className="text-xs font-medium text-red-600">Causa Raíz:</span>
                                  <p className="text-sm mt-1">{investigation.rootCause}</p>
                                </div>
                              )}
                            </div>
                          </div>

                          {investigation.conclusions && (
                            <div>
                              <h4 className="font-medium text-sm text-muted-foreground mb-2">Conclusiones</h4>
                              <p className="text-sm">{investigation.conclusions}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {invFindings.length > 0 && (
                        <div className="mt-6">
                          <h4 className="font-medium text-sm text-muted-foreground mb-3">Hallazgos y Acciones ({invFindings.length})</h4>
                          <div className="space-y-2">
                            {invFindings.map((finding: any) => (
                              <div key={finding.id} className="p-3 border rounded-lg">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <Badge variant="outline" className="text-xs">
                                        {FINDING_TYPES.find(t => t.value === finding.findingType)?.label || finding.findingType}
                                      </Badge>
                                      <Badge className={`text-xs ${FINDING_STATUS.find(s => s.value === finding.status)?.color || ""}`}>
                                        {FINDING_STATUS.find(s => s.value === finding.status)?.label || finding.status}
                                      </Badge>
                                    </div>
                                    <p className="text-sm">{finding.description}</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      Acción: {finding.correctiveAction}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      Responsable: {finding.responsibleName} | Fecha límite: {format(new Date(finding.dueDate), "dd/MM/yyyy")}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {invParticipants.length > 0 && (
                        <div className="mt-6">
                          <h4 className="font-medium text-sm text-muted-foreground mb-3">Participantes ({invParticipants.length})</h4>
                          <div className="flex flex-wrap gap-2">
                            {invParticipants.map((participant: any) => (
                              <Badge key={participant.id} variant="outline" className="py-1 px-2">
                                <Users className="h-3 w-3 mr-1" />
                                {participant.participantName} - {PARTICIPANT_ROLES.find(r => r.value === participant.participantRole)?.label || participant.participantRole}
                                {participant.hasLicense === 1 && (
                                  <FileCheck className="h-3 w-3 ml-1 text-green-600" />
                                )}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <Separator className="my-4" />
                      
                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(investigation)}
                          data-testid={`button-edit-${investigation.id}`}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Editar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openFindingDialog(investigation.id)}
                          data-testid={`button-add-finding-${investigation.id}`}
                        >
                          <ClipboardPlus className="h-4 w-4 mr-1" />
                          Agregar Hallazgo
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openParticipantDialog(investigation.id)}
                          data-testid={`button-add-participant-${investigation.id}`}
                        >
                          <UserPlus className="h-4 w-4 mr-1" />
                          Agregar Participante
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          data-testid={`button-download-pdf-${investigation.id}`}
                          onClick={() => {
                            window.open(`/api/investigations/${investigation.id}/pdf`, '_blank');
                          }}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Descargar PDF
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => {
                            if (confirm("¿Está seguro de eliminar esta investigación?")) {
                              deleteInvestigationMutation.mutate(investigation.id);
                            }
                          }}
                          data-testid={`button-delete-${investigation.id}`}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Eliminar
                        </Button>
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            );
          })}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingInvestigation ? "Editar Investigación" : "Nueva Investigación de Accidente"}
            </DialogTitle>
            <DialogDescription>
              Complete los datos de la investigación según Resolución 1401/2007
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="accidentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Accidente a Investigar *</FormLabel>
                      {accidents.length === 0 ? (
                        <div className="p-3 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-md">
                          <p className="text-amber-800 dark:text-amber-200 text-sm mb-2">
                            No hay accidentes registrados para investigar.
                          </p>
                          <Link href="/accidentes">
                            <Button type="button" variant="outline" size="sm" className="gap-2" data-testid="button-register-accident-from-form">
                              <Plus className="h-4 w-4" />
                              Registrar Accidente
                            </Button>
                          </Link>
                        </div>
                      ) : (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-accident">
                              <SelectValue placeholder="Seleccione accidente" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {accidents.map((accident) => (
                              <SelectItem key={accident.id} value={accident.id}>
                                {format(new Date(accident.date), "dd/MM/yyyy")} - {getWorkerName(accident.workerId)} - {accident.type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="eventType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Evento *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-event-type">
                            <SelectValue placeholder="Seleccione tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {EVENT_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="eventDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha del Evento *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} data-testid="input-event-date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="investigationStartDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha Inicio Investigación *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} data-testid="input-start-date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="analysisMethodology"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Metodología de Análisis *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-methodology">
                            <SelectValue placeholder="Seleccione metodología" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {ANALYSIS_METHODOLOGIES.map((method) => (
                            <SelectItem key={method.value} value={method.value}>{method.label}</SelectItem>
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
                name="eventDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción del Evento *</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Describa detalladamente el evento..."
                        className="min-h-24"
                        data-testid="textarea-description"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex flex-wrap gap-6">
                <FormField
                  control={form.control}
                  name="isSevere"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2">
                      <FormControl>
                        <Checkbox 
                          checked={field.value} 
                          onCheckedChange={field.onChange}
                          data-testid="checkbox-severe"
                        />
                      </FormControl>
                      <FormLabel className="!mt-0">Accidente Grave</FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="isFatal"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2">
                      <FormControl>
                        <Checkbox 
                          checked={field.value} 
                          onCheckedChange={field.onChange}
                          data-testid="checkbox-fatal"
                        />
                      </FormControl>
                      <FormLabel className="!mt-0">Accidente Mortal</FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="copasstParticipation"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2">
                      <FormControl>
                        <Checkbox 
                          checked={field.value} 
                          onCheckedChange={field.onChange}
                          data-testid="checkbox-copasst"
                        />
                      </FormControl>
                      <FormLabel className="!mt-0">Participación COPASST</FormLabel>
                    </FormItem>
                  )}
                />
              </div>

              {form.watch("copasstParticipation") && (
                <div className="grid md:grid-cols-3 gap-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <FormField
                    control={form.control}
                    name="copasstMemberName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Miembro COPASST</FormLabel>
                        <Select onValueChange={(value) => {
                          const miembro = copasstMiembros.find(m => m.id === value);
                          if (miembro) {
                            const worker = workers.find(w => w.id === miembro.workerId);
                            const nombreCompleto = worker?.name || "Sin nombre";
                            field.onChange(nombreCompleto);
                            const rolLabel = COPASST_ROLES.find(r => r.value === miembro.rolMiembro)?.label || miembro.rolMiembro;
                            form.setValue("copasstMemberRole", rolLabel);
                          }
                        }} value={copasstMiembros.find(m => {
                          const worker = workers.find(w => w.id === m.workerId);
                          return worker?.name === field.value;
                        })?.id || ""}>
                          <FormControl>
                            <SelectTrigger data-testid="select-copasst-member">
                              <SelectValue placeholder="Seleccionar miembro">
                                {field.value || "Seleccionar miembro"}
                              </SelectValue>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {copasstMiembros.length === 0 ? (
                              <SelectItem value="_empty" disabled>No hay miembros COPASST registrados</SelectItem>
                            ) : (
                              copasstMiembros.map((miembro) => {
                                const worker = workers.find(w => w.id === miembro.workerId);
                                const rolLabel = COPASST_ROLES.find(r => r.value === miembro.rolMiembro)?.label || miembro.rolMiembro;
                                return (
                                  <SelectItem key={miembro.id} value={miembro.id}>
                                    {worker?.name || "Sin nombre"} - {rolLabel}
                                  </SelectItem>
                                );
                              })
                            )}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="copasstMemberRole"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rol en COPASST</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-copasst-role">
                              <SelectValue placeholder="Seleccionar rol">
                                {field.value || "Seleccionar rol"}
                              </SelectValue>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {COPASST_ROLES.map((rol) => (
                              <SelectItem key={rol.value} value={rol.label}>
                                {rol.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="copasstActNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número de Acta</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-copasst-act">
                              <SelectValue placeholder="Seleccionar acta">
                                {field.value || "Seleccionar acta"}
                              </SelectValue>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {copasstActas.length === 0 ? (
                              <SelectItem value="_empty" disabled>No hay actas registradas</SelectItem>
                            ) : (
                              copasstActas.map((acta) => (
                                <SelectItem key={acta.id} value={acta.numeroActa}>
                                  {acta.numeroActa} - {format(new Date(acta.fecha), "dd/MM/yyyy")}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {isSevereOrFatal && (
                <div className="grid md:grid-cols-2 gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="md:col-span-2">
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-200 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Accidente grave/mortal: Requiere participación de profesional SST con licencia vigente
                    </p>
                  </div>
                  <FormField
                    control={form.control}
                    name="licensedProfessionalName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Profesional SST</FormLabel>
                        <Select onValueChange={(value) => {
                          const responsible = sstResponsibles.find(r => r.id === value);
                          if (responsible) {
                            // Para LSOs externos, usar fullName directamente
                            if ((responsible as any).isExternalLSO) {
                              field.onChange((responsible as any).fullName || responsible.position);
                              form.setValue("licensedProfessionalDocument", (responsible as any).documento || "");
                            } else {
                              // Para responsables internos, buscar en workers
                              const worker = workers.find(w => w.id === responsible.workerId);
                              field.onChange(worker?.name || responsible.position);
                              form.setValue("licensedProfessionalDocument", worker?.identificationNumber || "");
                            }
                            form.setValue("licensedProfessionalLicense", responsible.licenciaSstNumero || "");
                            form.setValue("licensedProfessionalLicenseExpiry", responsible.licenciaSstVigencia || "");
                          }
                        }} value={sstResponsibles.find(r => {
                          if ((r as any).isExternalLSO) {
                            return (r as any).fullName === field.value;
                          }
                          const worker = workers.find(w => w.id === r.workerId);
                          return worker?.name === field.value;
                        })?.id || ""}>
                          <FormControl>
                            <SelectTrigger data-testid="select-professional-sst">
                              <SelectValue placeholder="Seleccionar profesional">
                                {field.value || "Seleccionar profesional"}
                              </SelectValue>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {sstResponsibles.length === 0 ? (
                              <SelectItem value="_empty" disabled>No hay profesionales SST con licencia vigente</SelectItem>
                            ) : (
                              sstResponsibles.map((resp) => {
                                // Para LSOs externos, mostrar fullName
                                if ((resp as any).isExternalLSO) {
                                  return (
                                    <SelectItem key={resp.id} value={resp.id}>
                                      {(resp as any).fullName} - {resp.position} (LSO Externo)
                                    </SelectItem>
                                  );
                                }
                                // Para responsables internos, buscar en workers
                                const worker = workers.find(w => w.id === resp.workerId);
                                return (
                                  <SelectItem key={resp.id} value={resp.id}>
                                    {worker?.name || "Sin nombre"} - {resp.position}
                                  </SelectItem>
                                );
                              })
                            )}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="licensedProfessionalDocument"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Documento de Identidad</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Se auto-llena al seleccionar" readOnly className="bg-muted" data-testid="input-professional-doc" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="licensedProfessionalLicense"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número de Licencia SST</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Se auto-llena al seleccionar" readOnly className="bg-muted" data-testid="input-professional-license" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="licensedProfessionalLicenseExpiry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fecha Vencimiento Licencia</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} readOnly className="bg-muted" data-testid="input-professional-expiry" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              )}

              <Separator />

              <div>
                <h3 className="font-medium mb-4">Análisis de Causas</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Actos Inseguros (Causas Inmediatas)</Label>
                    <div className="mt-2 space-y-2 max-h-40 overflow-y-auto border rounded-lg p-2">
                      {IMMEDIATE_CAUSES_OPTIONS.map((cause) => (
                        <div key={cause.value} className="flex items-center gap-2">
                          <Checkbox
                            checked={form.watch("immediateActCauses")?.includes(cause.value)}
                            onCheckedChange={(checked) => {
                              const current = form.getValues("immediateActCauses") || [];
                              if (checked) {
                                form.setValue("immediateActCauses", [...current, cause.value]);
                              } else {
                                form.setValue("immediateActCauses", current.filter(c => c !== cause.value));
                              }
                            }}
                          />
                          <Label className="text-sm font-normal">{cause.label}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Condiciones Inseguras (Causas Inmediatas)</Label>
                    <div className="mt-2 space-y-2 max-h-40 overflow-y-auto border rounded-lg p-2">
                      {CONDITION_CAUSES_OPTIONS.map((cause) => (
                        <div key={cause.value} className="flex items-center gap-2">
                          <Checkbox
                            checked={form.watch("immediateConditionCauses")?.includes(cause.value)}
                            onCheckedChange={(checked) => {
                              const current = form.getValues("immediateConditionCauses") || [];
                              if (checked) {
                                form.setValue("immediateConditionCauses", [...current, cause.value]);
                              } else {
                                form.setValue("immediateConditionCauses", current.filter(c => c !== cause.value));
                              }
                            }}
                          />
                          <Label className="text-sm font-normal">{cause.label}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Factores Personales (Causas Básicas)</Label>
                    <div className="mt-2 space-y-2 max-h-40 overflow-y-auto border rounded-lg p-2">
                      {BASIC_PERSONAL_CAUSES.map((cause) => (
                        <div key={cause.value} className="flex items-center gap-2">
                          <Checkbox
                            checked={form.watch("basicPersonalCauses")?.includes(cause.value)}
                            onCheckedChange={(checked) => {
                              const current = form.getValues("basicPersonalCauses") || [];
                              if (checked) {
                                form.setValue("basicPersonalCauses", [...current, cause.value]);
                              } else {
                                form.setValue("basicPersonalCauses", current.filter(c => c !== cause.value));
                              }
                            }}
                          />
                          <Label className="text-sm font-normal">{cause.label}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Factores del Trabajo (Causas Básicas)</Label>
                    <div className="mt-2 space-y-2 max-h-40 overflow-y-auto border rounded-lg p-2">
                      {BASIC_WORK_CAUSES.map((cause) => (
                        <div key={cause.value} className="flex items-center gap-2">
                          <Checkbox
                            checked={form.watch("basicWorkCauses")?.includes(cause.value)}
                            onCheckedChange={(checked) => {
                              const current = form.getValues("basicWorkCauses") || [];
                              if (checked) {
                                form.setValue("basicWorkCauses", [...current, cause.value]);
                              } else {
                                form.setValue("basicWorkCauses", current.filter(c => c !== cause.value));
                              }
                            }}
                          />
                          <Label className="text-sm font-normal">{cause.label}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="rootCause"
                  render={({ field }) => (
                    <FormItem className="mt-4">
                      <FormLabel>Causa Raíz Identificada</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Describa la causa raíz del accidente..."
                          data-testid="textarea-root-cause"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              <div className="grid md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="conclusions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Conclusiones</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Conclusiones de la investigación..."
                          className="min-h-20"
                          data-testid="textarea-conclusions"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lessonLearned"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lecciones Aprendidas</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Lecciones aprendidas para prevenir futuros accidentes..."
                          className="min-h-20"
                          data-testid="textarea-lessons"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={createInvestigationMutation.isPending || updateInvestigationMutation.isPending}
                  data-testid="button-submit-investigation"
                >
                  {(createInvestigationMutation.isPending || updateInvestigationMutation.isPending) && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  {editingInvestigation ? "Guardar Cambios" : "Crear Investigación"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={participantDialogOpen} onOpenChange={setParticipantDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Agregar Participante</DialogTitle>
            <DialogDescription>
              Seleccione un trabajador para pre-llenar automáticamente los datos
            </DialogDescription>
          </DialogHeader>

          <Form {...participantForm}>
            <form onSubmit={participantForm.handleSubmit(handleAddParticipant)} className="space-y-4">
              {/* Selector de Trabajador para auto-completar */}
              <div className="p-3 bg-muted/50 rounded-lg border">
                <FormLabel className="text-sm font-medium">Seleccionar Trabajador</FormLabel>
                <Select 
                  onValueChange={(workerId) => {
                    const worker = workers.find((w: Worker) => String(w.id) === workerId);
                    if (worker) {
                      participantForm.setValue("participantName", worker.name || "");
                      participantForm.setValue("participantDocument", worker.identificationNumber || "");
                      participantForm.setValue("participantPosition", worker.position || "");
                      participantForm.setValue("participantArea", worker.department || "");
                    }
                  }}
                >
                  <SelectTrigger className="mt-2" data-testid="select-worker-autofill">
                    <SelectValue placeholder="Buscar trabajador para auto-completar..." />
                  </SelectTrigger>
                  <SelectContent>
                    {workers.filter((w: Worker) => w.status === "activo").map((worker: Worker) => (
                      <SelectItem key={worker.id} value={String(worker.id)}>
                        {worker.name} - {worker.identificationNumber}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={participantForm.control}
                  name="participantName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre del Participante *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Nombre completo" data-testid="input-participant-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={participantForm.control}
                  name="participantRole"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rol en la Investigación *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-participant-role">
                            <SelectValue placeholder="Seleccione rol" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {PARTICIPANT_ROLES.map((role) => (
                            <SelectItem key={role.value} value={role.value}>{role.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={participantForm.control}
                  name="participantDocument"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Documento</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="CC o CE" data-testid="input-participant-doc" />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={participantForm.control}
                  name="participantArea"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Área</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Área o departamento" data-testid="input-participant-area" />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={participantForm.control}
                name="participantPosition"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cargo</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Cargo o posición" data-testid="input-participant-position" />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={participantForm.control}
                name="hasLicense"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2">
                    <FormControl>
                      <Checkbox 
                        checked={field.value} 
                        onCheckedChange={field.onChange}
                        data-testid="checkbox-has-license"
                      />
                    </FormControl>
                    <FormLabel className="!mt-0">Tiene Licencia SST</FormLabel>
                  </FormItem>
                )}
              />

              {participantForm.watch("hasLicense") && (
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={participantForm.control}
                    name="licenseNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número de Licencia</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Número de licencia" data-testid="input-license-number" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={participantForm.control}
                    name="licenseExpiry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fecha Vencimiento</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} data-testid="input-license-expiry" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              )}

              <FormField
                control={participantForm.control}
                name="observations"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observaciones</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Observaciones adicionales..." data-testid="textarea-participant-obs" />
                    </FormControl>
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setParticipantDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={createParticipantMutation.isPending}
                  data-testid="button-submit-participant"
                >
                  {createParticipantMutation.isPending && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  Agregar Participante
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={findingDialogOpen} onOpenChange={setFindingDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Agregar Hallazgo</DialogTitle>
            <DialogDescription>
              Registre los hallazgos y acciones correctivas de la investigación
            </DialogDescription>
          </DialogHeader>

          <Form {...findingForm}>
            <form onSubmit={findingForm.handleSubmit(handleAddFinding)} className="space-y-4">
              <FormField
                control={findingForm.control}
                name="findingType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Hallazgo *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-finding-type">
                          <SelectValue placeholder="Seleccione tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {FINDING_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={findingForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción del Hallazgo *</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Describa el hallazgo..." data-testid="textarea-finding-desc" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={findingForm.control}
                name="correctiveAction"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Acción Correctiva *</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Describa la acción correctiva..." data-testid="textarea-corrective-action" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={findingForm.control}
                  name="responsibleName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Responsable *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Nombre del responsable" data-testid="input-finding-responsible" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={findingForm.control}
                  name="responsibleArea"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Área</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Área o departamento" data-testid="input-finding-area" />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={findingForm.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha Límite *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} data-testid="input-finding-due-date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setFindingDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={createFindingMutation.isPending}
                  data-testid="button-submit-finding"
                >
                  {createFindingMutation.isPending && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  Agregar Hallazgo
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
