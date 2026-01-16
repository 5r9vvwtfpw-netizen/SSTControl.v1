import { WorkerCard } from "@/components/WorkerCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, Search, Download, AlertCircle, CheckCircle2, Eye, CreditCard, FileText, Upload, User, Trash2, AlertTriangle, CalendarDays } from "lucide-react";
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Worker, insertWorkerSchema, Company, Contract, insertContractSchema, JobProfile } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { contractTypeLabels } from "@shared/arl-rates";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { PREDEFINED_PROFILES } from "@/data/perfiles-cargo-predefinidos";
import { Link } from "wouter";
import { Checkbox } from "@/components/ui/checkbox";
import { formatDateShort, formatCurrency, getTodayDateString } from "@/lib/utils/formatters";
import { hasCompanyAdminAccess, hasGlobalAccess } from "@shared/permissions";
import { AutomationAssistant } from "@/components/AutomationAssistant";
import { BackToEvaluationButton } from "@/components/BackToEvaluationButton";

const normativaTrabajadores = [
  {
    codigo: 'DEC-1072-2.2.4.6.8',
    norma: 'Decreto 1072/2015',
    articulo: 'Artículo 2.2.4.6.8',
    descripcion: 'Obligaciones de los empleadores - Gestión de trabajadores',
    requisitos: [
      'Definir y asignar responsabilidades en SST',
      'Documentar roles y responsabilidades',
      'Capacitación inicial y continua',
      'Participación de trabajadores en el SG-SST'
    ],
    obligatorio: true
  },
  {
    codigo: 'RES-0312-EST-1.1.6',
    norma: 'Resolución 0312/2019',
    articulo: 'Estándar 1.1.6',
    descripcion: 'Conformación COPASST / Vigía',
    requisitos: [
      'Registro actualizado de trabajadores',
      'Afiliación a ARL vigente',
      'Información de contacto de emergencia',
      'Historial de capacitaciones'
    ],
    obligatorio: true
  }
];

// Constantes de metadata para consentimientos Habeas Data (Ley 1581/2012)
const CONSENT_METADATA = {
  policyVersion: "1.0",
  policyDocumentUrl: "/politica-privacidad",
  consentType: "habeas_data_general" as const,
  channel: "web" as const,
  purposes: [
    "Gestión de la relación laboral y administración de personal",
    "Cumplimiento de obligaciones en materia de SST (Sistema de Gestión de Seguridad y Salud en el Trabajo)",
    "Comunicaciones empresariales y notificaciones relacionadas con la empresa",
    "Generación de informes y estadísticas internas de SST",
    "Cumplimiento de obligaciones legales y regulatorias aplicables"
  ].join("; ")
};

export default function Trabajadores() {
  const { user } = useAuth();
  const { toast} = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null);
  const [hasConsent, setHasConsent] = useState(false);

  // Obtener el ID del plan de trabajo guardado para la navegación de regreso
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
  
  // For admin: company selection filter
  const isAdmin = user?.role ? hasCompanyAdminAccess(user.role) : false;
  // hasGlobalAccess = true only for superadmin/soporte (can see all companies)
  const hasGlobalCompanyAccess = user?.role ? hasGlobalAccess(user.role) : false;
  // isSuperadmin = true only for superadmin/soporte (can select any company when creating workers)
  const isSuperadmin = user?.role ? hasGlobalAccess(user.role) : false;
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("all");
  
  // Effective company ID for filtering: global admins use selectedCompanyId, others use their own companyId
  const effectiveCompanyId = hasGlobalCompanyAccess ? selectedCompanyId : (user?.companyId || "");
  
  // Filtros para informes
  const [filterCedula, setFilterCedula] = useState("");
  const [filterName, setFilterName] = useState("");
  const [filterPosition, setFilterPosition] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  
  // Estados para importación Excel
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importResults, setImportResults] = useState<{
    successful: number;
    failed: number;
    errors: Array<{ row: number; error: string }>;
  } | null>(null);
  
  // Estados para eliminación masiva de trabajadores
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [bulkDeleteConfirmCode, setBulkDeleteConfirmCode] = useState("");
  const [bulkDeleteCompanyName, setBulkDeleteCompanyName] = useState("");
  const [bulkDeleteResults, setBulkDeleteResults] = useState<{
    message: string;
    deleted: number;
    total: number;
    errors?: string[];
  } | null>(null);
  
  const [formData, setFormData] = useState<{
    companyId: string;
    identificationNumber: string;
    name: string;
    email?: string;
    position: string;
    department: string;
    contractType: "indefinido" | "fijo" | "temporal" | "obra-labor" | "aprendizaje";
    contractNumber?: string;
    startDate: string;
    endDate: string;
    status: "activo" | "inactivo" | "retirado";
    jobProfileId?: string;
    gender?: string;
    birthDate?: string;
    educationLevel?: string;
    civilStatus?: string;
  }>({
    companyId: "",
    identificationNumber: "",
    name: "",
    email: "",
    position: "",
    department: "",
    contractType: "indefinido",
    startDate: "",
    endDate: "",
    status: "activo",
    jobProfileId: "",
    gender: "",
    birthDate: "",
    educationLevel: "",
    civilStatus: "",
  });

  // Photo display state (workers upload via portal)
  const [photoLoadError, setPhotoLoadError] = useState(false);

  const { data: workers = [], isLoading } = useQuery<Worker[]>({
    queryKey: ["/api/workers"],
  });

  const { data: companies = [] } = useQuery<Company[]>({
    queryKey: ["/api/companies"],
  });

  const { data: contracts = [] } = useQuery<Contract[]>({
    queryKey: ["/api/contracts"],
  });

  const { data: jobProfiles = [] } = useQuery<JobProfile[]>({
    queryKey: ["/api/job-profiles"],
  });

  const getContractStatus = (workerId: string): "activo" | "vencido" | "sin_contrato" => {
    const workerContracts = contracts.filter(c => c.workerId === workerId);
    if (workerContracts.length === 0) return "sin_contrato";
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (const contract of workerContracts) {
      if (contract.status === "activo") {
        if (contract.endDate && (contract.contractType === "fijo" || contract.contractType === "temporal" || contract.contractType === "obra_labor" || contract.contractType === "ocasional" || contract.contractType === "aprendizaje")) {
          const endDate = new Date(contract.endDate);
          endDate.setHours(0, 0, 0, 0);
          if (endDate < today) {
            return "vencido";
          }
        }
        return "activo";
      }
    }
    
    const hasExpiredContract = workerContracts.some(contract => {
      if (contract.endDate && (contract.contractType === "fijo" || contract.contractType === "temporal" || contract.contractType === "obra_labor" || contract.contractType === "ocasional" || contract.contractType === "aprendizaje")) {
        const endDate = new Date(contract.endDate);
        endDate.setHours(0, 0, 0, 0);
        return endDate < today;
      }
      return false;
    });
    
    if (hasExpiredContract) return "vencido";
    return "sin_contrato";
  };

  // Obtener consentimientos del trabajador cuando está en modo edición
  const { data: workerConsents = [] } = useQuery({
    queryKey: editingWorker ? ["/api/workers", editingWorker.id, "consents"] : [],
    queryFn: async () => {
      if (!editingWorker) return [];
      const res = await fetch(`/api/workers/${editingWorker.id}/consents`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!editingWorker
  });

  // Estado para la pestaña activa en el diálogo de edición
  const [activeDialogTab, setActiveDialogTab] = useState<string>("datos");
  
  // Estado para edición de contrato
  const [isEditingContract, setIsEditingContract] = useState(false);
  const [contractFormData, setContractFormData] = useState<{
    contractType: string;
    startDate: string;
    endDate: string;
    position: string;
    department: string;
    salary: number | string;
    workSchedule: string;
    status: string;
  }>({
    contractType: "indefinido",
    startDate: "",
    endDate: "",
    position: "",
    department: "",
    salary: "",
    workSchedule: "",
    status: "activo",
  });

  // Query para obtener contrato del trabajador cuando está en modo edición
  const { data: workerContract, isLoading: isLoadingContract } = useQuery<Contract[]>({
    queryKey: editingWorker ? ["/api/contracts/worker", editingWorker.id] : [],
    queryFn: async () => {
      if (!editingWorker) return [];
      const res = await fetch(`/api/contracts/worker/${editingWorker.id}`, {
        credentials: 'include'
      });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!editingWorker
  });

  // Sincronizar contractFormData cuando workerContract se carga (TICKET #4 - preservar salario)
  useEffect(() => {
    if (workerContract && workerContract.length > 0 && !isEditingContract) {
      const contract = workerContract[0];
      setContractFormData({
        contractType: contract.contractType,
        startDate: contract.startDate,
        endDate: contract.endDate || "",
        position: contract.position,
        department: contract.department || "",
        salary: contract.salary || 0,
        workSchedule: contract.workSchedule || "",
        status: contract.status,
      });
    }
  }, [workerContract, isEditingContract]);

  // Mutation para actualizar contrato
  const updateContractMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<z.infer<typeof insertContractSchema>> }) => {
      const res = await apiRequest("PATCH", `/api/contracts/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contracts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/contracts/worker", editingWorker?.id] });
      setIsEditingContract(false);
      toast({
        title: "Contrato actualizado",
        description: "Los datos del contrato se han actualizado exitosamente",
        className: "bg-yellow-50 border-yellow-200",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error al actualizar contrato",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation para crear contrato
  const createContractMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/contracts", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contracts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/contracts/worker", editingWorker?.id] });
      setIsEditingContract(false);
      toast({
        title: "Contrato creado",
        description: "El contrato se ha registrado exitosamente",
        className: "bg-yellow-50 border-yellow-200",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error al crear contrato",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Función para iniciar edición de contrato
  const handleStartEditContract = (contract: Contract) => {
    setContractFormData({
      contractType: contract.contractType,
      startDate: contract.startDate,
      endDate: contract.endDate || "",
      position: contract.position,
      department: contract.department || "",
      salary: contract.salary || 0,
      workSchedule: contract.workSchedule || "",
      status: contract.status,
    });
    setIsEditingContract(true);
  };

  // Función para guardar contrato editado
  const handleSaveContract = () => {
    if (!workerContract || workerContract.length === 0) return;
    const contract = workerContract[0];
    const salaryValue = contractFormData.salary === '' ? 0 : Number(contractFormData.salary);
    updateContractMutation.mutate({
      id: contract.id,
      data: {
        contractType: contractFormData.contractType as any,
        startDate: contractFormData.startDate,
        endDate: contractFormData.endDate || undefined,
        position: contractFormData.position,
        department: contractFormData.department,
        salary: salaryValue,
        workSchedule: contractFormData.workSchedule,
        status: contractFormData.status as any,
      },
    });
  };

  // Función para crear nuevo contrato
  const handleCreateContract = () => {
    if (!editingWorker) return;
    const salaryValue = contractFormData.salary === '' ? undefined : Number(contractFormData.salary);
    createContractMutation.mutate({
      workerId: editingWorker.id,
      companyId: editingWorker.companyId,
      identificationNumber: editingWorker.identificationNumber,
      contractType: contractFormData.contractType,
      startDate: contractFormData.startDate,
      endDate: contractFormData.endDate || undefined,
      position: contractFormData.position || editingWorker.position,
      department: contractFormData.department || editingWorker.department,
      salary: salaryValue,
      workSchedule: contractFormData.workSchedule || undefined,
      status: "activo",
    });
  };

  // Función para iniciar creación de contrato
  const handleStartCreateContract = () => {
    if (!editingWorker) return;
    setContractFormData({
      contractType: "indefinido",
      startDate: getTodayDateString(),
      endDate: "",
      position: editingWorker.position,
      department: editingWorker.department,
      salary: "",
      workSchedule: "",
      status: "activo",
    });
    setIsEditingContract(true);
  };

  const createWorkerMutation = useMutation({
    mutationFn: async (data: z.infer<typeof insertWorkerSchema>) => {
      // Guard: Verificar que el usuario esté autenticado
      if (!user?.id) {
        throw new Error("Debe estar autenticado para registrar trabajadores");
      }
      
      // STAGE 1: Crear trabajador
      const workerRes = await apiRequest("POST", "/api/workers", data);
      const createdWorker = await workerRes.json();
      
      // STAGE 2: Crear registro de consentimiento (obligatorio para cumplimiento legal)
      try {
        const consentPayload = {
          workerId: createdWorker.id,
          workerName: createdWorker.name,
          workerEmail: createdWorker.email || null,
          workerIdentification: createdWorker.identificationNumber,
          companyId: createdWorker.companyId,
          dataType: "informacion_laboral",
          consentType: CONSENT_METADATA.consentType,
          purpose: CONSENT_METADATA.purposes,
          channel: CONSENT_METADATA.channel,
          policyVersion: CONSENT_METADATA.policyVersion,
          policyDocumentUrl: CONSENT_METADATA.policyDocumentUrl,
          consentMethod: "Formulario de registro de trabajador",
          legalBasis: "consentimiento expreso - Ley 1581/2012",
          recordedBy: user.id, // Usuario que registró el consentimiento (garantizado por guard)
        };
        
        const consentRes = await apiRequest("POST", "/api/consent-records", consentPayload);
        await consentRes.json();
      } catch (consentError) {
        // ROLLBACK: Si el consentimiento falla, eliminar el trabajador creado
        try {
          await apiRequest("DELETE", `/api/workers/${createdWorker.id}`);
        } catch (deleteError) {
          // Ignorar errores 404 en el rollback
          console.error("Error en rollback de trabajador:", deleteError);
        }
        
        // Re-lanzar el error para que onError lo maneje
        throw new Error("No se pudo registrar el consentimiento. El trabajador no fue creado. Por favor, intente nuevamente.");
      }
      
      return createdWorker;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/contracts"] });
      setDialogOpen(false);
      setEditingWorker(null);
      setHasConsent(false);
      setFormData({
        companyId: "",
        identificationNumber: "",
        name: "",
        email: "",
        position: "",
        department: "",
        contractType: "indefinido",
        startDate: "",
        endDate: "",
        status: "activo",
        jobProfileId: "",
        gender: "",
        birthDate: "",
        educationLevel: "",
        civilStatus: "",
      });
      toast({
        title: "Trabajador creado",
        description: "El trabajador y su consentimiento se han registrado exitosamente",
        className: "bg-yellow-50 border-yellow-200",
      });
    },
    onError: (error: Error) => {
      // Mantener el dialog abierto para permitir retry
      toast({
        title: "Error al registrar trabajador",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateWorkerMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<z.infer<typeof insertWorkerSchema>> }) => {
      const res = await apiRequest("PATCH", `/api/workers/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workers"] });
      setDialogOpen(false);
      setEditingWorker(null);
      setFormData({
        companyId: "",
        identificationNumber: "",
        name: "",
        email: "",
        position: "",
        department: "",
        contractType: "indefinido",
        startDate: "",
        endDate: "",
        status: "activo",
        jobProfileId: "",
        gender: "",
        birthDate: "",
        educationLevel: "",
        civilStatus: "",
      });
      toast({
        title: "Trabajador actualizado",
        description: "Los datos se han actualizado exitosamente",
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

  const deleteWorkerMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/workers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workers"] });
      toast({
        title: "Trabajador eliminado",
        description: "El trabajador se ha eliminado exitosamente",
        className: "bg-yellow-50 border-yellow-200",
      });
    },
    onError: (error: Error) => {
      // Extract message without status code prefix
      let message = error.message;
      if (message.includes("contratos asociados")) {
        message = "No se puede eliminar el trabajador porque tiene contratos asociados. Primero elimine los contratos del trabajador.";
      } else if (message.startsWith("400:") || message.startsWith("403:") || message.startsWith("404:")) {
        message = message.substring(message.indexOf(":") + 1).trim();
      }
      toast({
        title: "No se puede eliminar",
        description: message,
        variant: "destructive",
      });
    },
  });

  const createPortalAccessMutation = useMutation({
    mutationFn: async (workerId: string) => {
      const res = await apiRequest("POST", `/api/workers/${workerId}/create-portal-access`);
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/workers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Acceso al portal creado",
        description: `Se ha creado el acceso y enviado las credenciales a ${data.user?.email || 'el trabajador'}`,
        className: "bg-yellow-50 border-yellow-200",
      });
    },
    onError: (error: Error) => {
      let message = error.message;
      if (message.startsWith("400:") || message.startsWith("403:") || message.startsWith("404:")) {
        message = message.substring(message.indexOf(":") + 1).trim();
      }
      toast({
        title: "Error al crear acceso",
        description: message,
        variant: "destructive",
      });
    },
  });

  // Mutación para eliminación masiva de trabajadores
  const bulkDeleteMutation = useMutation({
    mutationFn: async ({ companyId, confirmationCode, confirmCompanyName }: { companyId: string; confirmationCode: string; confirmCompanyName: string }) => {
      const res = await apiRequest("DELETE", `/api/workers/bulk-delete/${companyId}`, {
        confirmationCode,
        confirmCompanyName,
      });
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/workers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/contracts"] });
      setBulkDeleteResults(data);
      setBulkDeleteConfirmCode("");
      setBulkDeleteCompanyName("");
      toast({
        title: "Eliminación masiva completada",
        description: `Se eliminaron ${data.deleted} de ${data.total} trabajadores`,
        className: "bg-yellow-50 border-yellow-200",
      });
    },
    onError: (error: Error) => {
      let message = error.message;
      if (message.startsWith("400:") || message.startsWith("403:") || message.startsWith("404:")) {
        message = message.substring(message.indexOf(":") + 1).trim();
      }
      toast({
        title: "Error en eliminación masiva",
        description: message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.companyId) {
      toast({
        title: "Error",
        description: "Debe seleccionar una empresa",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.identificationNumber || formData.identificationNumber.trim() === "") {
      toast({
        title: "Error",
        description: "La cédula de ciudadanía es obligatoria",
        variant: "destructive",
      });
      return;
    }
    
    // Validar consentimiento para nuevos trabajadores (Ley 1581/2012)
    if (!editingWorker && !hasConsent) {
      toast({
        title: "Error",
        description: "Debe aceptar el consentimiento para el tratamiento de datos personales",
        variant: "destructive",
      });
      return;
    }
    
    // Limpiar la cédula: eliminar solo caracteres de formateo (puntos, guiones, espacios)
    // Preservar letras y números para extranjeros (ej: K0C89Y06, pasaportes alfanuméricos)
    const cleanedCedula = formData.identificationNumber
      .replace(/[.\-\s]/g, '') // Solo eliminar puntos, guiones y espacios
      .toUpperCase()
      .trim();
    
    // Validar que después de limpiar, tengamos al menos un carácter alfanumérico
    if (!cleanedCedula || cleanedCedula.length === 0) {
      toast({
        title: "Error",
        description: "El número de identificación es obligatorio",
        variant: "destructive",
      });
      return;
    }
    
    // Preparar los datos con la cédula limpia
    const cleanedFormData = {
      ...formData,
      identificationNumber: cleanedCedula,
      endDate: formData.endDate || undefined,
    };
    
    if (editingWorker) {
      updateWorkerMutation.mutate({
        id: editingWorker.id,
        data: cleanedFormData,
      });
    } else {
      createWorkerMutation.mutate(cleanedFormData);
    }
  };

  const handleEdit = (worker: Worker) => {
    setEditingWorker(worker);
    setActiveDialogTab("datos");
    setIsEditingContract(false);
    setPhotoLoadError(false);
    setFormData({
      companyId: worker.companyId,
      identificationNumber: worker.identificationNumber || "",
      name: worker.name,
      email: worker.email || "",
      position: worker.position,
      department: worker.department,
      contractType: worker.contractType,
      contractNumber: worker.contractNumber,
      startDate: worker.startDate,
      endDate: worker.endDate || "",
      status: worker.status,
      jobProfileId: worker.jobProfileId || "",
      gender: worker.gender || "",
      birthDate: worker.birthDate || "",
      educationLevel: worker.educationLevel || "",
      civilStatus: worker.civilStatus || "",
    });
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("¿Está seguro de eliminar este trabajador?")) {
      deleteWorkerMutation.mutate(id);
    }
  };

  const handleOpenDialog = () => {
    setEditingWorker(null);
    setHasConsent(false);
    setActiveDialogTab("datos");
    setIsEditingContract(false);
    // For admin: default to selected company in filter only if it's a valid company (not "all")
    // For non-admin: use their own companyId
    // Auto-seleccionar si solo hay una empresa disponible
    let defaultCompanyId = "";
    if (isAdmin) {
      // Si solo hay una empresa, auto-seleccionarla
      if (companies.length === 1) {
        defaultCompanyId = companies[0].id;
      } else if (selectedCompanyId !== "all") {
        // If filter is set to a specific company (not "all"), use it as default
        defaultCompanyId = selectedCompanyId;
      }
    } else {
      defaultCompanyId = user?.companyId || "";
    }
    
    setFormData({
      companyId: defaultCompanyId,
      identificationNumber: "",
      name: "",
      email: "",
      position: "",
      department: "",
      contractType: "indefinido",
      contractNumber: "",
      startDate: "",
      endDate: "",
      status: "activo",
      jobProfileId: "",
      gender: "",
      birthDate: "",
      educationLevel: "",
      civilStatus: "",
    });
    setDialogOpen(true);
  };

  const filteredWorkers = workers.filter((worker) => {
    // Filter by company: admins can see all or filter by company, non-admins see only their company
    if (effectiveCompanyId && effectiveCompanyId !== "all" && worker.companyId !== effectiveCompanyId) {
      return false;
    }
    
    // Filter by search term
    return worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      worker.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      worker.department.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Filtrado para informes
  const filteredWorkersForReports = workers.filter((worker) => {
    // Filter by company: admins can see all or filter by company, non-admins see only their company
    if (effectiveCompanyId && effectiveCompanyId !== "all" && worker.companyId !== effectiveCompanyId) {
      return false;
    }
    
    const matchesCedula = !filterCedula || (worker.identificationNumber && worker.identificationNumber.includes(filterCedula));
    const matchesName = !filterName || worker.name.toLowerCase().includes(filterName.toLowerCase());
    const matchesPosition = !filterPosition || worker.position.toLowerCase().includes(filterPosition.toLowerCase());
    
    return matchesCedula && matchesName && matchesPosition;
  });

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const params = new URLSearchParams();
      if (filterCedula) params.append('cedula', filterCedula);
      if (filterName) params.append('name', filterName);
      if (filterPosition) params.append('position', filterPosition);

      const response = await fetch(`/api/reports/trabajadores-filtrados?${params.toString()}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Error al generar el informe');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `informe_trabajadores_${getTodayDateString()}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Informe exportado",
        description: "El informe se ha descargado exitosamente",
        className: "bg-yellow-300 text-black border-yellow-400",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo generar el informe",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrintCard = async (workerId: string, workerName: string) => {
    try {
      const response = await fetch(`/api/reports/tarjeta/${workerId}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Error al generar la tarjeta');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const sanitizedName = workerName.replace(/\s+/g, '_');
      a.download = `tarjeta_${sanitizedName}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Tarjeta generada",
        description: "La tarjeta de identificación se ha descargado exitosamente",
        className: "bg-yellow-300 text-black border-yellow-400",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo generar la tarjeta",
        variant: "destructive",
      });
    }
  };

  const handleCompleteReport = async (workerId: string, workerName: string) => {
    try {
      const response = await fetch(`/api/reports/trabajador-completo/${workerId}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Error al generar el informe');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const sanitizedName = workerName.replace(/\s+/g, '_');
      a.download = `informe_completo_${sanitizedName}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Informe generado",
        description: "El informe completo del trabajador se ha descargado exitosamente",
        className: "bg-yellow-300 text-black border-yellow-400",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo generar el informe",
        variant: "destructive",
      });
    }
  };

  // Funciones de importación Excel
  const handleDownloadTemplate = async () => {
    try {
      const url = effectiveCompanyId && effectiveCompanyId !== "all"
        ? `/api/workers/template/download?companyId=${effectiveCompanyId}`
        : '/api/workers/template/download';
      
      const response = await fetch(url, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Error al descargar la plantilla');
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = 'plantilla_trabajadores.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);

      toast({
        title: "Plantilla descargada",
        description: "La plantilla Excel ha sido descargada exitosamente",
        className: "bg-yellow-50 border-yellow-200",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setImportResults(null);
    }
  };

  const importMutation = useMutation({
    mutationFn: async (file: File) => {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);
      if (effectiveCompanyId && effectiveCompanyId !== "all") {
        formDataUpload.append('companyId', effectiveCompanyId);
      }

      const response = await fetch('/api/workers/import', {
        method: 'POST',
        credentials: 'include',
        body: formDataUpload
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al importar trabajadores');
      }

      return response.json();
    },
    onSuccess: (data) => {
      setImportResults(data);
      queryClient.invalidateQueries({ queryKey: ["/api/workers"] });
      
      if (data.failed === 0) {
        toast({
          title: "Importación exitosa",
          description: `Se importaron ${data.successful} trabajadores correctamente`,
          className: "bg-yellow-50 border-yellow-200",
        });
      } else {
        toast({
          title: "Importación completada con errores",
          description: `${data.successful} exitosos, ${data.failed} con errores`,
          variant: "default",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleImport = () => {
    if (!selectedFile) {
      toast({
        title: "Error",
        description: "Debe seleccionar un archivo",
        variant: "destructive",
      });
      return;
    }
    importMutation.mutate(selectedFile);
  };

  const handleResetImport = () => {
    setSelectedFile(null);
    setImportResults(null);
    setImportDialogOpen(false);
  };

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
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Trabajadores</h1>
          <p className="text-muted-foreground">Gestión de trabajadores y contratos</p>
        </div>
        <AutomationAssistant
          titulo="Gestión de Trabajadores"
          estandar="1.1.6"
          descripcion="Administración del personal y cumplimiento de obligaciones en SST"
          normativaAplicable={normativaTrabajadores}
          compact={true}
        />
        {user?.role && hasCompanyAdminAccess(user.role) && (
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleDownloadTemplate} variant="outline" data-testid="button-download-template">
              <Download className="h-4 w-4 mr-2" />
              Descargar Plantilla
            </Button>
            <Dialog open={importDialogOpen} onOpenChange={(open) => {
              setImportDialogOpen(open);
              if (!open) {
                setSelectedFile(null);
                setImportResults(null);
              }
            }}>
              <DialogTrigger asChild>
                <Button variant="outline" data-testid="button-import-excel">
                  <Upload className="h-4 w-4 mr-2" />
                  Importar Excel
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Importar Trabajadores</DialogTitle>
                  <DialogDescription>
                    Seleccione un archivo Excel con los datos de los trabajadores
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="importFile">Archivo Excel</Label>
                    <Input
                      id="importFile"
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={handleFileSelect}
                      data-testid="input-import-file"
                    />
                    {selectedFile && (
                      <p className="text-sm text-muted-foreground">
                        Archivo: {selectedFile.name}
                      </p>
                    )}
                  </div>
                  
                  {importResults && (
                    <div className="space-y-2">
                      <Alert className={importResults.failed === 0 ? "border-green-500" : "border-yellow-500"}>
                        <AlertDescription>
                          <div className="space-y-1">
                            <p className="font-medium">Resultados de la importación:</p>
                            <p className="text-green-600">Exitosos: {importResults.successful}</p>
                            {importResults.failed > 0 && (
                              <p className="text-red-600">Con errores: {importResults.failed}</p>
                            )}
                          </div>
                        </AlertDescription>
                      </Alert>
                      {importResults.errors && importResults.errors.length > 0 && (
                        <div className="max-h-32 overflow-y-auto text-sm">
                          {importResults.errors.map((err, idx) => (
                            <p key={idx} className="text-red-500">
                              Fila {err.row}: {err.error}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <DialogFooter>
                  {importResults ? (
                    <Button onClick={handleResetImport} data-testid="button-close-import">
                      Cerrar
                    </Button>
                  ) : (
                    <Button 
                      onClick={handleImport} 
                      disabled={!selectedFile || importMutation.isPending}
                      data-testid="button-submit-import"
                    >
                      {importMutation.isPending ? "Importando..." : "Importar"}
                    </Button>
                  )}
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            {/* Botón de eliminación masiva - Solo visible con empresa seleccionada */}
            {effectiveCompanyId && effectiveCompanyId !== "all" && (() => {
              const selectedCompany = companies.find(c => c.id === effectiveCompanyId);
              const workersInCompany = workers.filter(w => w.companyId === effectiveCompanyId);
              const workerCount = workersInCompany.length;
              
              return (
                <Dialog 
                  open={bulkDeleteDialogOpen} 
                  onOpenChange={(open) => {
                    setBulkDeleteDialogOpen(open);
                    if (!open) {
                      setBulkDeleteConfirmCode("");
                      setBulkDeleteCompanyName("");
                      setBulkDeleteResults(null);
                    }
                  }}
                >
                  <DialogTrigger asChild>
                    <Button 
                      variant="destructive" 
                      className="bg-red-600 hover:bg-red-700"
                      data-testid="button-bulk-delete"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      Eliminar Todos
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                    {/* Header con fondo rojo de alerta */}
                    <div className="bg-red-600 -m-6 mb-4 p-6 rounded-t-lg">
                      <DialogHeader>
                        <DialogTitle className="text-white flex items-center gap-2 text-xl">
                          <AlertTriangle className="h-6 w-6" />
                          ¡ADVERTENCIA! ACCIÓN IRREVERSIBLE
                        </DialogTitle>
                        <DialogDescription className="text-red-100">
                          Esta operación eliminará PERMANENTEMENTE todos los trabajadores de esta empresa
                        </DialogDescription>
                      </DialogHeader>
                    </div>
                    
                    {bulkDeleteResults ? (
                      <div className="space-y-4">
                        <Alert className={bulkDeleteResults.errors && bulkDeleteResults.errors.length > 0 ? "border-yellow-500 bg-yellow-50" : "border-green-500 bg-green-50"}>
                          <CheckCircle2 className="h-4 w-4" />
                          <AlertDescription>
                            <div className="space-y-2">
                              <p className="font-bold text-lg">{bulkDeleteResults.message}</p>
                              <p>Trabajadores eliminados: <span className="font-bold">{bulkDeleteResults.deleted}</span> de {bulkDeleteResults.total}</p>
                              {bulkDeleteResults.errors && bulkDeleteResults.errors.length > 0 && (
                                <div className="mt-2">
                                  <p className="text-yellow-700 font-medium">Errores encontrados:</p>
                                  <ul className="text-sm text-yellow-600 list-disc pl-4 max-h-24 overflow-y-auto">
                                    {bulkDeleteResults.errors.map((err, idx) => (
                                      <li key={idx}>{err}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </AlertDescription>
                        </Alert>
                        <DialogFooter>
                          <Button 
                            onClick={() => {
                              setBulkDeleteDialogOpen(false);
                              setBulkDeleteResults(null);
                            }}
                            data-testid="button-close-bulk-delete"
                          >
                            Cerrar
                          </Button>
                        </DialogFooter>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {/* Alertas visuales */}
                        <div className="space-y-3">
                          <Alert variant="destructive" className="border-red-500 bg-red-50">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription className="text-red-800">
                              <strong>¡ATENCIÓN!</strong> Esta acción NO se puede deshacer. Todos los datos de los trabajadores se perderán permanentemente.
                            </AlertDescription>
                          </Alert>
                          
                          <div className="bg-amber-50 border border-amber-300 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                              <div>
                                <p className="font-semibold text-amber-800">Empresa seleccionada:</p>
                                <p className="text-lg font-bold text-amber-900">{selectedCompany?.name || "No seleccionada"}</p>
                                <p className="text-amber-700 mt-1">
                                  Se eliminarán <span className="font-bold text-red-600 text-xl">{workerCount}</span> trabajadores
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Campos de confirmación */}
                        <div className="space-y-4 border-t pt-4">
                          <p className="text-sm text-muted-foreground font-medium">
                            Para confirmar esta operación, complete los siguientes campos exactamente:
                          </p>
                          
                          <div className="space-y-2">
                            <Label htmlFor="bulkDeleteCode" className="text-red-700 font-semibold">
                              Escriba exactamente: ELIMINAR-TODOS-LOS-TRABAJADORES
                            </Label>
                            <Input
                              id="bulkDeleteCode"
                              value={bulkDeleteConfirmCode}
                              onChange={(e) => setBulkDeleteConfirmCode(e.target.value)}
                              placeholder="ELIMINAR-TODOS-LOS-TRABAJADORES"
                              className={bulkDeleteConfirmCode === "ELIMINAR-TODOS-LOS-TRABAJADORES" ? "border-green-500 bg-green-50" : "border-red-300"}
                              data-testid="input-bulk-delete-code"
                            />
                            {bulkDeleteConfirmCode && bulkDeleteConfirmCode !== "ELIMINAR-TODOS-LOS-TRABAJADORES" && (
                              <p className="text-xs text-red-500">El código no coincide</p>
                            )}
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="bulkDeleteCompanyName" className="text-red-700 font-semibold">
                              Escriba el nombre exacto de la empresa: {selectedCompany?.name}
                            </Label>
                            <Input
                              id="bulkDeleteCompanyName"
                              value={bulkDeleteCompanyName}
                              onChange={(e) => setBulkDeleteCompanyName(e.target.value)}
                              placeholder={selectedCompany?.name || "Nombre de la empresa"}
                              className={bulkDeleteCompanyName === selectedCompany?.name ? "border-green-500 bg-green-50" : "border-red-300"}
                              data-testid="input-bulk-delete-company-name"
                            />
                            {bulkDeleteCompanyName && bulkDeleteCompanyName !== selectedCompany?.name && (
                              <p className="text-xs text-red-500">El nombre de la empresa no coincide</p>
                            )}
                          </div>
                        </div>
                        
                        <DialogFooter className="flex flex-col sm:flex-row gap-2">
                          <Button
                            variant="outline"
                            onClick={() => setBulkDeleteDialogOpen(false)}
                            data-testid="button-cancel-bulk-delete"
                          >
                            Cancelar
                          </Button>
                          <Button
                            variant="destructive"
                            className="bg-red-600 hover:bg-red-700"
                            disabled={
                              bulkDeleteConfirmCode !== "ELIMINAR-TODOS-LOS-TRABAJADORES" ||
                              bulkDeleteCompanyName !== selectedCompany?.name ||
                              bulkDeleteMutation.isPending ||
                              workerCount === 0
                            }
                            onClick={() => {
                              if (effectiveCompanyId && selectedCompany) {
                                bulkDeleteMutation.mutate({
                                  companyId: effectiveCompanyId,
                                  confirmationCode: bulkDeleteConfirmCode,
                                  confirmCompanyName: bulkDeleteCompanyName,
                                });
                              }
                            }}
                            data-testid="button-confirm-bulk-delete"
                          >
                            {bulkDeleteMutation.isPending ? (
                              "Eliminando..."
                            ) : (
                              <>
                                <Trash2 className="h-4 w-4 mr-2" />
                                Eliminar Permanentemente {workerCount} Trabajadores
                              </>
                            )}
                          </Button>
                        </DialogFooter>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
              );
            })()}
            
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={handleOpenDialog} data-testid="button-add-worker">
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Trabajador
                </Button>
              </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingWorker ? "Editar Trabajador" : "Registrar Nuevo Trabajador"}</DialogTitle>
                <DialogDescription>Complete los datos del trabajador</DialogDescription>
              </DialogHeader>
              
              {editingWorker ? (
                <Tabs value={activeDialogTab} onValueChange={setActiveDialogTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="datos" data-testid="tab-worker-data">Datos del Trabajador</TabsTrigger>
                    <TabsTrigger value="contrato" data-testid="tab-contract">Contrato</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="datos" className="mt-4">
                    <form onSubmit={handleSubmit} className="space-y-4">
                      {/* Photo Display Section - Workers upload their own photos via portal */}
                      <div className="flex flex-col items-center gap-3 pb-4 border-b">
                        <Label className="text-sm font-medium">Foto para Carnet</Label>
                        <div className="h-24 w-24 rounded-lg border-2 border-muted overflow-hidden bg-muted flex items-center justify-center">
                          {editingWorker?.photoUrl && !photoLoadError ? (
                            <img 
                              src={`${editingWorker.photoUrl}${editingWorker.photoUrl.includes('?') ? '&' : '?'}t=${Date.now()}`} 
                              alt={editingWorker.fullName || "Foto del trabajador"}
                              className="h-full w-full object-cover"
                              onError={() => setPhotoLoadError(true)}
                            />
                          ) : (
                            <User className="h-10 w-10 text-muted-foreground" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground text-center">
                          {editingWorker?.photoUrl ? "Foto subida por el trabajador" : "El trabajador puede subir su foto desde el Portal de Empleados"}
                        </p>
                      </div>
                      {isSuperadmin && (
                        <div className="space-y-2 col-span-2">
                          <Label htmlFor="company">Empresa *</Label>
                          <Select
                            value={formData.companyId}
                            onValueChange={(value) => setFormData({ ...formData, companyId: value })}
                          >
                            <SelectTrigger id="company" data-testid="select-company">
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
                        </div>
                      )}
                      <div className="space-y-2">
                        <Label htmlFor="identificationNumber">Cédula de Ciudadanía, Pasaporte o Cédula de Extranjería *</Label>
                        <Input
                          id="identificationNumber"
                          value={formData.identificationNumber}
                          onChange={(e) => setFormData({ ...formData, identificationNumber: e.target.value })}
                          placeholder="Ej: 1234567890, AA123456 o 1.234.567.890"
                          required
                          data-testid="input-identification-number"
                        />
                        <p className="text-xs text-muted-foreground">
                          Acepta cédula de ciudadanía, pasaporte o cédula de extranjería (números y letras)
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Nombre Completo *</Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            data-testid="input-worker-name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email || ""}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="correo@ejemplo.com"
                            data-testid="input-worker-email"
                          />
                          <p className="text-xs text-muted-foreground">
                            Requerido para notificaciones de vencimientos
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="jobProfile">Perfil de Cargo</Label>
                        <Select
                          value={formData.jobProfileId || ""}
                          onValueChange={(value) => {
                            if (value === "__none__") {
                              setFormData({ ...formData, jobProfileId: "" });
                            } else {
                              const selectedProfile = jobProfiles.find(p => p.id === value);
                              if (selectedProfile) {
                                const predefinedProfile = PREDEFINED_PROFILES[selectedProfile.name];
                                setFormData({ 
                                  ...formData, 
                                  jobProfileId: value,
                                  position: selectedProfile.name,
                                  department: predefinedProfile?.department || formData.department
                                });
                              }
                            }
                          }}
                        >
                          <SelectTrigger id="jobProfile" data-testid="select-job-profile">
                            <SelectValue placeholder="Seleccione perfil de cargo" />
                          </SelectTrigger>
                          <SelectContent className="max-h-[300px]">
                            <SelectItem value="__none__">Sin perfil asignado</SelectItem>
                            {jobProfiles
                              .filter(p => p.isActive === 1 && p.companyId === formData.companyId)
                              .map((profile) => (
                                <SelectItem key={profile.id} value={profile.id}>
                                  {profile.name} - Clase {profile.riskClass}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                          Al seleccionar un perfil se auto-completará el cargo
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="position">Cargo</Label>
                          <Select
                            value={formData.position}
                            onValueChange={(value) => {
                              const profile = PREDEFINED_PROFILES[value];
                              if (profile) {
                                setFormData({ 
                                  ...formData, 
                                  position: value,
                                  department: profile.department 
                                });
                              } else {
                                setFormData({ ...formData, position: value });
                              }
                            }}
                          >
                            <SelectTrigger id="position" data-testid="select-position">
                              <SelectValue placeholder="Seleccione el cargo" />
                            </SelectTrigger>
                            <SelectContent className="max-h-[300px]">
                              {Object.keys(PREDEFINED_PROFILES).sort().map((profileName) => (
                                <SelectItem key={profileName} value={profileName}>
                                  {profileName}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="department">Departamento</Label>
                          {(() => {
                            const uniqueDepartments = Array.from(
                              new Set(Object.values(PREDEFINED_PROFILES).map(p => p.department))
                            ).sort();
                            const isCustomDepartment = !uniqueDepartments.includes(formData.department) && formData.department !== "";
                            
                            return (
                              <>
                                <Select
                                  value={isCustomDepartment ? "__custom__" : formData.department}
                                  onValueChange={(value) => {
                                    if (value === "__custom__") {
                                      setFormData({ ...formData, department: "" });
                                    } else {
                                      setFormData({ ...formData, department: value });
                                    }
                                  }}
                                >
                                  <SelectTrigger id="department-select" data-testid="select-department">
                                    <SelectValue placeholder="Seleccione el departamento" />
                                  </SelectTrigger>
                                  <SelectContent className="max-h-[200px]">
                                    <SelectItem value="__custom__">
                                      Departamento Personalizado
                                    </SelectItem>
                                    {uniqueDepartments.map((dept) => (
                                      <SelectItem key={dept} value={dept}>
                                        {dept}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                {(formData.department === "" || isCustomDepartment) && (
                                  <Input
                                    id="department"
                                    value={formData.department}
                                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                    placeholder="Ingrese el departamento personalizado"
                                    required
                                    data-testid="input-custom-department"
                                    className="mt-2"
                                  />
                                )}
                              </>
                            );
                          })()}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="contractType">Tipo de Contrato</Label>
                          <Select
                            value={formData.contractType}
                            onValueChange={(value: any) => setFormData({ ...formData, contractType: value })}
                          >
                            <SelectTrigger id="contractType" data-testid="select-contract-type">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="indefinido">Indefinido</SelectItem>
                              <SelectItem value="fijo">Fijo</SelectItem>
                              <SelectItem value="temporal">Temporal</SelectItem>
                              <SelectItem value="obra-labor">Obra o Labor</SelectItem>
                              <SelectItem value="aprendizaje">Aprendizaje</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="contractNumber">Número de Contrato (Automático)</Label>
                          <Input
                            id="contractNumber"
                            value={formData.contractNumber}
                            disabled
                            className="bg-muted cursor-not-allowed"
                            data-testid="input-contract-number"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="startDate">Fecha de Inicio</Label>
                          <Input
                            id="startDate"
                            type="date"
                            value={formData.startDate}
                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                            required
                            data-testid="input-start-date"
                          />
                        </div>
                        {formData.contractType !== "indefinido" && (
                          <div className="space-y-2">
                            <Label htmlFor="endDate">Fecha de Fin (opcional)</Label>
                            <Input
                              id="endDate"
                              type="date"
                              value={formData.endDate}
                              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                              data-testid="input-end-date"
                            />
                          </div>
                        )}
                        <div className="space-y-2">
                          <Label htmlFor="status">Estado</Label>
                          <Select
                            value={formData.status}
                            onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                          >
                            <SelectTrigger id="status" data-testid="select-status">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="activo">Activo</SelectItem>
                              <SelectItem value="inactivo">Inactivo</SelectItem>
                              <SelectItem value="retirado">Retirado</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Datos Sociodemográficos (Estándar 3.1.1) */}
                      <div className="space-y-4 border-t pt-4 mt-4">
                        <h4 className="font-semibold text-sm">Datos Sociodemográficos (Estándar 3.1.1)</h4>
                        <p className="text-xs text-muted-foreground">
                          Información requerida para cumplimiento de Resolución 0312/2019
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="gender">Género</Label>
                            <Select
                              value={formData.gender || ""}
                              onValueChange={(value) => setFormData({ ...formData, gender: value || "" })}
                            >
                              <SelectTrigger id="gender" data-testid="select-gender">
                                <SelectValue placeholder="Seleccione género" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="masculino">Masculino</SelectItem>
                                <SelectItem value="femenino">Femenino</SelectItem>
                                <SelectItem value="otro">Otro</SelectItem>
                                <SelectItem value="prefiero_no_decir">Prefiero no decir</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="birthDate">Fecha de Nacimiento</Label>
                            <Input
                              id="birthDate"
                              type="date"
                              value={formData.birthDate || ""}
                              onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                              data-testid="input-birth-date"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="educationLevel">Nivel Educativo</Label>
                            <Select
                              value={formData.educationLevel || ""}
                              onValueChange={(value) => setFormData({ ...formData, educationLevel: value || "" })}
                            >
                              <SelectTrigger id="educationLevel" data-testid="select-education-level">
                                <SelectValue placeholder="Seleccione nivel educativo" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="ninguno">Ninguno</SelectItem>
                                <SelectItem value="primaria">Primaria</SelectItem>
                                <SelectItem value="secundaria">Secundaria</SelectItem>
                                <SelectItem value="tecnico">Técnico</SelectItem>
                                <SelectItem value="tecnologo">Tecnólogo</SelectItem>
                                <SelectItem value="profesional">Profesional</SelectItem>
                                <SelectItem value="especializacion">Especialización</SelectItem>
                                <SelectItem value="maestria">Maestría</SelectItem>
                                <SelectItem value="doctorado">Doctorado</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="civilStatus">Estado Civil</Label>
                            <Select
                              value={formData.civilStatus || ""}
                              onValueChange={(value) => setFormData({ ...formData, civilStatus: value || "" })}
                            >
                              <SelectTrigger id="civilStatus" data-testid="select-civil-status">
                                <SelectValue placeholder="Seleccione estado civil" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="soltero">Soltero(a)</SelectItem>
                                <SelectItem value="casado">Casado(a)</SelectItem>
                                <SelectItem value="union_libre">Unión Libre</SelectItem>
                                <SelectItem value="divorciado">Divorciado(a)</SelectItem>
                                <SelectItem value="viudo">Viudo(a)</SelectItem>
                                <SelectItem value="separado">Separado(a)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>

                      {workerConsents.length > 0 && (
                        <div className="space-y-3 border-t pt-4 mt-4">
                          <h4 className="font-semibold text-sm">Estado del Consentimiento</h4>
                          <div className="flex items-start space-x-3 p-3 rounded-lg border bg-muted/50">
                            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                            <div className="flex-1 space-y-1">
                              <p className="text-sm font-medium">Consentimiento otorgado</p>
                              <p className="text-xs text-muted-foreground">
                                {workerConsents[0].consentType === 'habeas_data_general' ? 'Tratamiento de datos personales (Ley 1581/2012)' : workerConsents[0].consentType}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Registrado el {new Date(workerConsents[0].consentDate).toLocaleDateString('es-CO')} vía {workerConsents[0].channel}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      <DialogFooter className="flex flex-wrap gap-2">
                        {/* Botones ocultos - SST-2026-0116
                        <Button 
                          type="button" 
                          variant="outline"
                          onClick={() => handleCompleteReport(editingWorker.id, editingWorker.name)}
                          data-testid="button-complete-report"
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Informe Completo
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline"
                          onClick={() => handlePrintCard(editingWorker.id, editingWorker.name)}
                          data-testid="button-print-card"
                        >
                          <CreditCard className="h-4 w-4 mr-2" />
                          Imprimir Tarjeta
                        </Button>
                        */}
                        <Button 
                          type="submit" 
                          disabled={updateWorkerMutation.isPending || !user?.id} 
                          data-testid="button-submit-worker"
                        >
                          {updateWorkerMutation.isPending ? "Guardando..." : "Actualizar"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </TabsContent>
                  
                  <TabsContent value="contrato" className="mt-4 space-y-4">
                    {isLoadingContract ? (
                      <div className="space-y-4">
                        <div className="h-4 bg-muted rounded animate-pulse w-1/3" />
                        <div className="h-20 bg-muted rounded animate-pulse" />
                      </div>
                    ) : workerContract && workerContract.length > 0 ? (
                      <div className="space-y-4">
                        {!isEditingContract ? (
                          <>
                            <div className="rounded-lg border p-4 space-y-3">
                              <div className="flex items-center justify-between">
                                <h4 className="font-semibold">Información del Contrato</h4>
                                <Badge 
                                  variant={workerContract[0].status === "activo" ? "default" : "secondary"}
                                  data-testid="text-contract-status"
                                >
                                  {workerContract[0].status === "activo" ? "Activo" : 
                                   workerContract[0].status === "vencido" ? "Vencido" : 
                                   workerContract[0].status === "terminado" ? "Terminado" : "Suspendido"}
                                </Badge>
                              </div>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <p className="text-muted-foreground">Número de Contrato</p>
                                  <p className="font-medium" data-testid="text-contract-number">{workerContract[0].contractNumber}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Tipo de Contrato</p>
                                  <p className="font-medium" data-testid="text-contract-type">
                                    {contractTypeLabels[workerContract[0].contractType] || workerContract[0].contractType}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Fecha de Inicio</p>
                                  <p className="font-medium" data-testid="text-contract-start-date">
                                    {new Date(workerContract[0].startDate).toLocaleDateString('es-CO')}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Fecha de Fin</p>
                                  <p className="font-medium" data-testid="text-contract-end-date">
                                    {workerContract[0].endDate 
                                      ? new Date(workerContract[0].endDate).toLocaleDateString('es-CO') 
                                      : "Indefinido"}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Cargo</p>
                                  <p className="font-medium" data-testid="text-contract-position">{workerContract[0].position}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Departamento</p>
                                  <p className="font-medium" data-testid="text-contract-department">{workerContract[0].department || "No especificado"}</p>
                                </div>
                                {workerContract[0].salary !== null && workerContract[0].salary !== undefined && workerContract[0].salary > 0 && (
                                  <div>
                                    <p className="text-muted-foreground">Salario</p>
                                    <p className="font-medium" data-testid="text-contract-salary">
                                      {formatCurrency(workerContract[0].salary)}
                                    </p>
                                  </div>
                                )}
                                {workerContract[0].workSchedule && (
                                  <div>
                                    <p className="text-muted-foreground">Horario</p>
                                    <p className="font-medium" data-testid="text-contract-schedule">{workerContract[0].workSchedule}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                            <Button 
                              onClick={() => handleStartEditContract(workerContract[0])}
                              data-testid="button-update-contract"
                            >
                              <FileText className="h-4 w-4 mr-2" />
                              Actualizar Contrato
                            </Button>
                          </>
                        ) : (
                          <div className="space-y-4">
                            <h4 className="font-semibold">Editar Contrato</h4>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Tipo de Contrato</Label>
                                <Select
                                  value={contractFormData.contractType}
                                  onValueChange={(value) => setContractFormData({ ...contractFormData, contractType: value })}
                                >
                                  <SelectTrigger data-testid="select-edit-contract-type">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="indefinido">Término Indefinido</SelectItem>
                                    <SelectItem value="fijo">Término Fijo</SelectItem>
                                    <SelectItem value="obra_labor">Obra o Labor</SelectItem>
                                    <SelectItem value="ocasional">Ocasional/Transitorio</SelectItem>
                                    <SelectItem value="aprendizaje">Aprendizaje</SelectItem>
                                    <SelectItem value="servicios">Prestación de Servicios</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label>Estado</Label>
                                <Select
                                  value={contractFormData.status}
                                  onValueChange={(value) => setContractFormData({ ...contractFormData, status: value })}
                                >
                                  <SelectTrigger data-testid="select-edit-contract-status">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="activo">Activo</SelectItem>
                                    <SelectItem value="vencido">Vencido</SelectItem>
                                    <SelectItem value="terminado">Terminado</SelectItem>
                                    <SelectItem value="suspendido">Suspendido</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label>Fecha de Inicio</Label>
                                <Input
                                  type="date"
                                  value={contractFormData.startDate}
                                  onChange={(e) => setContractFormData({ ...contractFormData, startDate: e.target.value })}
                                  data-testid="input-edit-contract-start-date"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Fecha de Fin</Label>
                                <Input
                                  type="date"
                                  value={contractFormData.endDate}
                                  onChange={(e) => setContractFormData({ ...contractFormData, endDate: e.target.value })}
                                  data-testid="input-edit-contract-end-date"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Cargo</Label>
                                <Input
                                  value={contractFormData.position}
                                  onChange={(e) => setContractFormData({ ...contractFormData, position: e.target.value })}
                                  data-testid="input-edit-contract-position"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Departamento</Label>
                                <Input
                                  value={contractFormData.department}
                                  onChange={(e) => setContractFormData({ ...contractFormData, department: e.target.value })}
                                  data-testid="input-edit-contract-department"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Salario</Label>
                                <Input
                                  type="number"
                                  value={contractFormData.salary}
                                  onChange={(e) => setContractFormData({ ...contractFormData, salary: e.target.value === '' ? '' : e.target.value })}
                                  data-testid="input-edit-contract-salary"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Horario de Trabajo</Label>
                                <Input
                                  value={contractFormData.workSchedule}
                                  onChange={(e) => setContractFormData({ ...contractFormData, workSchedule: e.target.value })}
                                  placeholder="Ej: Lunes a Viernes 8:00-17:00"
                                  data-testid="input-edit-contract-schedule"
                                />
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                onClick={() => setIsEditingContract(false)}
                                data-testid="button-cancel-contract-edit"
                              >
                                Cancelar
                              </Button>
                              <Button 
                                onClick={handleSaveContract}
                                disabled={updateContractMutation.isPending}
                                data-testid="button-save-contract"
                              >
                                {updateContractMutation.isPending ? "Guardando..." : "Guardar Cambios"}
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8 space-y-4">
                        <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                          <FileText className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium" data-testid="text-no-contract">Este trabajador no tiene contrato registrado</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Puede crear un contrato manual para registrar la información laboral
                          </p>
                        </div>
                        {!isEditingContract ? (
                          <Button onClick={handleStartCreateContract} data-testid="button-create-contract">
                            <Plus className="h-4 w-4 mr-2" />
                            Crear Contrato Manual
                          </Button>
                        ) : (
                          <div className="space-y-4 text-left">
                            <h4 className="font-semibold text-center">Nuevo Contrato</h4>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Tipo de Contrato *</Label>
                                <Select
                                  value={contractFormData.contractType}
                                  onValueChange={(value) => setContractFormData({ ...contractFormData, contractType: value })}
                                >
                                  <SelectTrigger data-testid="select-new-contract-type">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="indefinido">Término Indefinido</SelectItem>
                                    <SelectItem value="fijo">Término Fijo</SelectItem>
                                    <SelectItem value="obra_labor">Obra o Labor</SelectItem>
                                    <SelectItem value="ocasional">Ocasional/Transitorio</SelectItem>
                                    <SelectItem value="aprendizaje">Aprendizaje</SelectItem>
                                    <SelectItem value="servicios">Prestación de Servicios</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label>Fecha de Inicio *</Label>
                                <Input
                                  type="date"
                                  value={contractFormData.startDate}
                                  onChange={(e) => setContractFormData({ ...contractFormData, startDate: e.target.value })}
                                  required
                                  data-testid="input-new-contract-start-date"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Fecha de Fin</Label>
                                <Input
                                  type="date"
                                  value={contractFormData.endDate}
                                  onChange={(e) => setContractFormData({ ...contractFormData, endDate: e.target.value })}
                                  data-testid="input-new-contract-end-date"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Cargo *</Label>
                                <Input
                                  value={contractFormData.position}
                                  onChange={(e) => setContractFormData({ ...contractFormData, position: e.target.value })}
                                  required
                                  data-testid="input-new-contract-position"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Departamento</Label>
                                <Input
                                  value={contractFormData.department}
                                  onChange={(e) => setContractFormData({ ...contractFormData, department: e.target.value })}
                                  data-testid="input-new-contract-department"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Salario</Label>
                                <Input
                                  type="number"
                                  value={contractFormData.salary}
                                  onChange={(e) => setContractFormData({ ...contractFormData, salary: e.target.value === '' ? '' : e.target.value })}
                                  data-testid="input-new-contract-salary"
                                />
                              </div>
                            </div>
                            <div className="flex gap-2 justify-center">
                              <Button 
                                variant="outline" 
                                onClick={() => setIsEditingContract(false)}
                                data-testid="button-cancel-contract-create"
                              >
                                Cancelar
                              </Button>
                              <Button 
                                onClick={handleCreateContract}
                                disabled={createContractMutation.isPending || !contractFormData.startDate || !contractFormData.position}
                                data-testid="button-submit-create-contract"
                              >
                                {createContractMutation.isPending ? "Creando..." : "Crear Contrato"}
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                {isSuperadmin && (
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="company">Empresa *</Label>
                    <Select
                      value={formData.companyId}
                      onValueChange={(value) => setFormData({ ...formData, companyId: value })}
                    >
                      <SelectTrigger id="company" data-testid="select-company">
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
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="identificationNumber">Cédula de Ciudadanía, Pasaporte o Cédula de Extranjería *</Label>
                  <Input
                    id="identificationNumber"
                    value={formData.identificationNumber}
                    onChange={(e) => setFormData({ ...formData, identificationNumber: e.target.value })}
                    placeholder="Ej: 1234567890, AA123456 o 1.234.567.890"
                    required
                    data-testid="input-identification-number"
                  />
                  <p className="text-xs text-muted-foreground">
                    Acepta cédula de ciudadanía, pasaporte o cédula de extranjería (números y letras)
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre Completo *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      data-testid="input-worker-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email || ""}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="correo@ejemplo.com"
                      data-testid="input-worker-email"
                    />
                    <p className="text-xs text-muted-foreground">
                      Requerido para notificaciones de vencimientos
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="jobProfile">Perfil de Cargo</Label>
                  <Select
                    value={formData.jobProfileId || ""}
                    onValueChange={(value) => {
                      if (value === "__none__") {
                        setFormData({ ...formData, jobProfileId: "" });
                      } else {
                        const selectedProfile = jobProfiles.find(p => p.id === value);
                        if (selectedProfile) {
                          const predefinedProfile = PREDEFINED_PROFILES[selectedProfile.name];
                          setFormData({ 
                            ...formData, 
                            jobProfileId: value,
                            position: selectedProfile.name,
                            department: predefinedProfile?.department || formData.department
                          });
                        }
                      }
                    }}
                  >
                    <SelectTrigger id="jobProfile" data-testid="select-job-profile-create">
                      <SelectValue placeholder="Seleccione perfil de cargo" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      <SelectItem value="__none__">Sin perfil asignado</SelectItem>
                      {jobProfiles
                        .filter(p => p.isActive === 1 && p.companyId === formData.companyId)
                        .map((profile) => (
                          <SelectItem key={profile.id} value={profile.id}>
                            {profile.name} - Clase {profile.riskClass}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Al seleccionar un perfil se auto-completará el cargo
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="position">Cargo</Label>
                    <Select
                      value={formData.position}
                      onValueChange={(value) => {
                        const profile = PREDEFINED_PROFILES[value];
                        if (profile && !editingWorker) {
                          setFormData({ 
                            ...formData, 
                            position: value,
                            department: profile.department 
                          });
                        } else {
                          setFormData({ ...formData, position: value });
                        }
                      }}
                    >
                      <SelectTrigger id="position" data-testid="select-position">
                        <SelectValue placeholder="Seleccione el cargo" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        {Object.keys(PREDEFINED_PROFILES).sort().map((profileName) => (
                          <SelectItem key={profileName} value={profileName}>
                            {profileName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Departamento</Label>
                    {(() => {
                      const uniqueDepartments = Array.from(
                        new Set(Object.values(PREDEFINED_PROFILES).map(p => p.department))
                      ).sort();
                      const isCustomDepartment = !uniqueDepartments.includes(formData.department) && formData.department !== "";
                      
                      return (
                        <>
                          <Select
                            value={isCustomDepartment ? "__custom__" : formData.department}
                            onValueChange={(value) => {
                              if (value === "__custom__") {
                                setFormData({ ...formData, department: "" });
                              } else {
                                setFormData({ ...formData, department: value });
                              }
                            }}
                          >
                            <SelectTrigger id="department-select" data-testid="select-department">
                              <SelectValue placeholder="Seleccione el departamento" />
                            </SelectTrigger>
                            <SelectContent className="max-h-[200px]">
                              <SelectItem value="__custom__">
                                Departamento Personalizado
                              </SelectItem>
                              {uniqueDepartments.map((dept) => (
                                <SelectItem key={dept} value={dept}>
                                  {dept}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {(formData.department === "" || isCustomDepartment) && (
                            <Input
                              id="department"
                              value={formData.department}
                              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                              placeholder="Ingrese el departamento personalizado"
                              required
                              data-testid="input-custom-department"
                              className="mt-2"
                            />
                          )}
                        </>
                      );
                    })()}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contractType">Tipo de Contrato</Label>
                    <Select
                      value={formData.contractType}
                      onValueChange={(value: any) => setFormData({ ...formData, contractType: value })}
                    >
                      <SelectTrigger id="contractType" data-testid="select-contract-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="indefinido">Indefinido</SelectItem>
                        <SelectItem value="fijo">Fijo</SelectItem>
                        <SelectItem value="temporal">Temporal</SelectItem>
                        <SelectItem value="obra-labor">Obra o Labor</SelectItem>
                        <SelectItem value="aprendizaje">Aprendizaje</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {editingWorker && (
                    <div className="space-y-2">
                      <Label htmlFor="contractNumber">Número de Contrato (Automático)</Label>
                      <Input
                        id="contractNumber"
                        value={formData.contractNumber}
                        disabled
                        className="bg-muted cursor-not-allowed"
                        data-testid="input-contract-number"
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Fecha de Inicio</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      required
                      data-testid="input-start-date"
                    />
                  </div>
                  {formData.contractType !== "indefinido" && (
                    <div className="space-y-2">
                      <Label htmlFor="endDate">Fecha de Fin (opcional)</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        data-testid="input-end-date"
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="status">Estado</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                    >
                      <SelectTrigger id="status" data-testid="select-status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="activo">Activo</SelectItem>
                        <SelectItem value="inactivo">Inactivo</SelectItem>
                        <SelectItem value="retirado">Retirado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Datos Sociodemográficos (Estándar 3.1.1) */}
                <div className="space-y-4 border-t pt-4 mt-4">
                  <h4 className="font-semibold text-sm">Datos Sociodemográficos (Estándar 3.1.1)</h4>
                  <p className="text-xs text-muted-foreground">
                    Información requerida para cumplimiento de Resolución 0312/2019
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="gender-create">Género</Label>
                      <Select
                        value={formData.gender || ""}
                        onValueChange={(value) => setFormData({ ...formData, gender: value || "" })}
                      >
                        <SelectTrigger id="gender-create" data-testid="select-gender-create">
                          <SelectValue placeholder="Seleccione género" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="masculino">Masculino</SelectItem>
                          <SelectItem value="femenino">Femenino</SelectItem>
                          <SelectItem value="otro">Otro</SelectItem>
                          <SelectItem value="prefiero_no_decir">Prefiero no decir</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="birthDate-create">Fecha de Nacimiento</Label>
                      <Input
                        id="birthDate-create"
                        type="date"
                        value={formData.birthDate || ""}
                        onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                        data-testid="input-birth-date-create"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="educationLevel-create">Nivel Educativo</Label>
                      <Select
                        value={formData.educationLevel || ""}
                        onValueChange={(value) => setFormData({ ...formData, educationLevel: value || "" })}
                      >
                        <SelectTrigger id="educationLevel-create" data-testid="select-education-level-create">
                          <SelectValue placeholder="Seleccione nivel educativo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ninguno">Ninguno</SelectItem>
                          <SelectItem value="primaria">Primaria</SelectItem>
                          <SelectItem value="secundaria">Secundaria</SelectItem>
                          <SelectItem value="tecnico">Técnico</SelectItem>
                          <SelectItem value="tecnologo">Tecnólogo</SelectItem>
                          <SelectItem value="profesional">Profesional</SelectItem>
                          <SelectItem value="especializacion">Especialización</SelectItem>
                          <SelectItem value="maestria">Maestría</SelectItem>
                          <SelectItem value="doctorado">Doctorado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="civilStatus-create">Estado Civil</Label>
                      <Select
                        value={formData.civilStatus || ""}
                        onValueChange={(value) => setFormData({ ...formData, civilStatus: value || "" })}
                      >
                        <SelectTrigger id="civilStatus-create" data-testid="select-civil-status-create">
                          <SelectValue placeholder="Seleccione estado civil" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="soltero">Soltero(a)</SelectItem>
                          <SelectItem value="casado">Casado(a)</SelectItem>
                          <SelectItem value="union_libre">Unión Libre</SelectItem>
                          <SelectItem value="divorciado">Divorciado(a)</SelectItem>
                          <SelectItem value="viudo">Viudo(a)</SelectItem>
                          <SelectItem value="separado">Separado(a)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Sección de Consentimiento Habeas Data */}
                {!editingWorker ? (
                  /* MODO CREACIÓN: Solicitar consentimiento */
                  <div className="space-y-4 border-t pt-4 mt-4">
                    <h4 className="font-semibold text-base">Consentimiento para Tratamiento de Datos Personales</h4>
                    <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                      <AlertDescription className="text-sm leading-relaxed">
                        <strong>De conformidad con la Ley 1581 de 2012 (Habeas Data) y el GDPR,</strong> los datos personales del trabajador serán tratados para las siguientes finalidades:
                        <ul className="list-disc ml-5 mt-2 space-y-1">
                          <li>Gestión de la relación laboral y administración de personal</li>
                          <li>Cumplimiento de obligaciones en materia de SST (Sistema de Gestión de Seguridad y Salud en el Trabajo)</li>
                          <li>Comunicaciones empresariales y notificaciones relacionadas con la empresa</li>
                          <li>Generación de informes y estadísticas internas de SST</li>
                          <li>Cumplimiento de obligaciones legales y regulatorias aplicables</li>
                        </ul>
                        <p className="mt-3">
                          El trabajador puede ejercer sus derechos ARCO (Acceso, Rectificación, Cancelación y Oposición) en cualquier momento.
                        </p>
                      </AlertDescription>
                    </Alert>
                    <div className="flex items-start space-x-3 p-3 rounded-lg border bg-card">
                      <Checkbox
                        id="consent"
                        checked={hasConsent}
                        onCheckedChange={(checked) => setHasConsent(checked === true)}
                        data-testid="checkbox-consent"
                        className="mt-1"
                      />
                      <Label htmlFor="consent" className="font-normal leading-relaxed text-sm cursor-pointer">
                        Autorizo de manera libre, previa, expresa e informada el tratamiento de mis datos personales según lo establecido en la{" "}
                        <Link href={CONSENT_METADATA.policyDocumentUrl}>
                          <span className="text-primary underline hover:text-primary/80">
                            Política de Privacidad
                          </span>
                        </Link>{" "}
                        (versión {CONSENT_METADATA.policyVersion}) y acepto que puedo ejercer mis derechos ARCO en cualquier momento. *
                      </Label>
                    </div>
                  </div>
                ) : (
                  /* MODO EDICIÓN: Mostrar estado del consentimiento */
                  workerConsents.length > 0 && (
                    <div className="space-y-3 border-t pt-4 mt-4">
                      <h4 className="font-semibold text-sm">Estado del Consentimiento</h4>
                      <div className="flex items-start space-x-3 p-3 rounded-lg border bg-muted/50">
                        <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium">Consentimiento otorgado</p>
                          <p className="text-xs text-muted-foreground">
                            {workerConsents[0].consentType === 'habeas_data_general' ? 'Tratamiento de datos personales (Ley 1581/2012)' : workerConsents[0].consentType}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Registrado el {new Date(workerConsents[0].consentDate).toLocaleDateString('es-CO')} vía {workerConsents[0].channel}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                )}

                <DialogFooter className="flex flex-wrap gap-2">
                  {/* Botones ocultos - SST-2026-0116
                  {editingWorker && (
                    <>
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => handleCompleteReport(editingWorker.id, editingWorker.name)}
                        data-testid="button-complete-report"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Informe Completo
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => handlePrintCard(editingWorker.id, editingWorker.name)}
                        data-testid="button-print-card"
                      >
                        <CreditCard className="h-4 w-4 mr-2" />
                        Imprimir Tarjeta
                      </Button>
                    </>
                  )}
                  */}
                  <Button 
                    type="submit" 
                    disabled={createWorkerMutation.isPending || updateWorkerMutation.isPending || !user?.id} 
                    data-testid="button-submit-worker"
                  >
                    {(createWorkerMutation.isPending || updateWorkerMutation.isPending) 
                      ? "Guardando..." 
                      : (editingWorker ? "Actualizar" : "Guardar")}
                  </Button>
                </DialogFooter>
              </form>
              )}
            </DialogContent>
          </Dialog>
          </div>
        )}
      </div>

      <Tabs defaultValue="lista" className="space-y-4">
        <TabsList>
          <TabsTrigger value="lista" data-testid="tab-lista">Lista de Trabajadores</TabsTrigger>
          <TabsTrigger value="informes" data-testid="tab-informes">Informes de Trabajadores</TabsTrigger>
        </TabsList>

        <TabsContent value="lista" className="space-y-4">
          {hasGlobalCompanyAccess && (
            <div className="mb-4">
              <Label htmlFor="company-filter">Filtrar por empresa</Label>
              <Select
                value={selectedCompanyId}
                onValueChange={setSelectedCompanyId}
                data-testid="select-company-filter"
              >
                <SelectTrigger id="company-filter">
                  <SelectValue placeholder="Todas las empresas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las empresas</SelectItem>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, cargo o departamento..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              data-testid="input-search-workers"
            />
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Cargando trabajadores...</p>
            </div>
          ) : filteredWorkers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No se encontraron trabajadores</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredWorkers.map((worker) => (
                <WorkerCard
                  key={worker.id}
                  id={worker.id}
                  name={worker.name}
                  position={worker.position}
                  department={worker.department}
                  contract={worker.contractType}
                  startDate={formatDateShort(worker.startDate)}
                  status={worker.status}
                  email={worker.email}
                  photoUrl={worker.photoUrl}
                  hasUserAccount={!!worker.userId}
                  contractStatus={getContractStatus(worker.id)}
                  onEdit={user?.role && hasCompanyAdminAccess(user.role) ? () => handleEdit(worker) : undefined}
                  onDelete={user?.role && hasCompanyAdminAccess(user.role) ? () => handleDelete(worker.id) : undefined}
                  onCreatePortalAccess={user?.role && hasCompanyAdminAccess(user.role) && worker.email && !worker.userId ? () => createPortalAccessMutation.mutate(worker.id) : undefined}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="informes" className="space-y-4">
          <div className="bg-card rounded-lg border p-6 space-y-4">
            <h2 className="text-xl font-semibold">Filtros de Búsqueda</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="filter-cedula">Cédula de Ciudadanía, Pasaporte o Extranjería</Label>
                <Input
                  id="filter-cedula"
                  placeholder="Ej: 1234567890 o AA123456"
                  value={filterCedula}
                  onChange={(e) => setFilterCedula(e.target.value)}
                  data-testid="input-filter-cedula"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="filter-name">Nombre</Label>
                <Input
                  id="filter-name"
                  placeholder="Ej: Juan Pérez"
                  value={filterName}
                  onChange={(e) => setFilterName(e.target.value)}
                  data-testid="input-filter-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="filter-position">Cargo</Label>
                <Input
                  id="filter-position"
                  placeholder="Ej: Operario"
                  value={filterPosition}
                  onChange={(e) => setFilterPosition(e.target.value)}
                  data-testid="input-filter-position"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setFilterCedula("");
                  setFilterName("");
                  setFilterPosition("");
                }}
                data-testid="button-clear-filters"
              >
                Limpiar Filtros
              </Button>
              <Button
                onClick={handleExportPDF}
                disabled={isExporting}
                data-testid="button-export-pdf"
              >
                <Download className="h-4 w-4 mr-2" />
                {isExporting ? "Generando PDF..." : "Exportar PDF"}
              </Button>
            </div>
          </div>

          <div className="bg-card rounded-lg border">
            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Cargando trabajadores...</p>
              </div>
            ) : filteredWorkersForReports.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No se encontraron trabajadores con los filtros aplicados</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cédula</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Cargo</TableHead>
                    <TableHead>Departamento</TableHead>
                    <TableHead>Tipo de Contrato</TableHead>
                    <TableHead>Fecha de Inicio</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Estado Contrato</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredWorkersForReports.map((worker) => (
                    <TableRow key={worker.id} data-testid={`row-worker-${worker.id}`}>
                      <TableCell data-testid={`cell-cedula-${worker.id}`}>
                        {worker.identificationNumber || "N/A"}
                      </TableCell>
                      <TableCell data-testid={`cell-name-${worker.id}`}>
                        {worker.name}
                      </TableCell>
                      <TableCell data-testid={`cell-position-${worker.id}`}>
                        {worker.position}
                      </TableCell>
                      <TableCell data-testid={`cell-department-${worker.id}`}>
                        {worker.department}
                      </TableCell>
                      <TableCell data-testid={`cell-contract-type-${worker.id}`}>
                        {worker.contractType}
                      </TableCell>
                      <TableCell data-testid={`cell-start-date-${worker.id}`}>
                        {formatDateShort(worker.startDate)}
                      </TableCell>
                      <TableCell data-testid={`cell-status-${worker.id}`}>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          worker.status === "activo" ? "bg-green-100 text-green-800" :
                          worker.status === "inactivo" ? "bg-yellow-100 text-yellow-800" :
                          "bg-red-100 text-red-800"
                        }`}>
                          {worker.status}
                        </span>
                      </TableCell>
                      <TableCell data-testid={`cell-contract-status-${worker.id}`}>
                        {(() => {
                          const contractStatus = getContractStatus(worker.id);
                          return (
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              contractStatus === "activo" 
                                ? "bg-green-600 text-white" 
                                : contractStatus === "vencido" 
                                ? "bg-yellow-100 text-yellow-800" 
                                : "bg-gray-100 text-gray-600"
                            }`}>
                              <FileText className="h-3 w-3 mr-1" />
                              {contractStatus === "activo" ? "Contrato" : contractStatus === "vencido" ? "Contrato Vencido" : "Sin Contrato"}
                            </span>
                          );
                        })()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(worker)}
                          data-testid={`button-view-worker-${worker.id}`}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Ver Detalles
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
