import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Contract, Worker, JobProfile, Company } from "@shared/schema";
import { insertContractSchema } from "@shared/schema";
import { contractTypeLabels, getArlRateFormatted, getArlRate } from "@shared/arl-rates";
import { PREDEFINED_PROFILES } from "@/data/perfiles-cargo-predefinidos";
import type { z } from "zod";
import { BackToCronogramaButton } from "@/components/BackToCronogramaButton";

// Departamentos predefinidos extraídos de perfiles de cargo colombianos
const DEPARTAMENTOS_PREDEFINIDOS = [
  "Dirección",
  "Administrativo",
  "Finanzas",
  "Contabilidad",
  "Recursos Humanos",
  "Comercial",
  "Ventas",
  "Marketing",
  "Operaciones",
  "Producción",
  "Logística",
  "Almacén",
  "Compras",
  "Calidad",
  "Mantenimiento",
  "Tecnología",
  "Sistemas",
  "Legal",
  "Jurídico",
  "Salud Ocupacional",
  "SST",
  "Seguridad",
  "Construcción",
  "Ingeniería",
  "Laboratorio",
  "Servicio al Cliente",
  "Recepción",
  "Cocina",
  "Servicios Generales",
  "Transporte",
  "Agroindustria",
  "Salud",
];

// Horarios de trabajo predefinidos según Ley 2101/2021 (44 horas semanales desde 2025)
const HORARIOS_PREDEFINIDOS = [
  { value: "lun-vie-44h", label: "Lunes a Viernes 8:00am - 4:48pm (44h semanales)" },
  { value: "lun-vie-44h-7am", label: "Lunes a Viernes 7:00am - 3:48pm (44h semanales)" },
  { value: "lun-vie-44h-6am", label: "Lunes a Viernes 6:00am - 2:48pm (44h semanales)" },
  { value: "lun-sab-44h", label: "Lunes a Viernes 8:00am-5:00pm + Sábado 8:00am-12:00pm (44h semanales)" },
  { value: "lun-vie-44h-flex", label: "Lunes a Viernes - Jornada Flexible (44h semanales)" },
  { value: "turnos-rotativos", label: "Turnos Rotativos (44h semanales según programación)" },
  { value: "turno-diurno-44h", label: "Turno Diurno 6:00am - 2:48pm (44h semanales)" },
  { value: "turno-tarde-44h", label: "Turno Tarde 2:00pm - 10:48pm (44h semanales)" },
  { value: "turno-noche-44h", label: "Turno Nocturno 10:00pm - 6:48am (44h semanales)" },
  { value: "medio-tiempo-am", label: "Medio Tiempo Mañana 8:00am - 12:00pm (22h semanales)" },
  { value: "medio-tiempo-pm", label: "Medio Tiempo Tarde 2:00pm - 6:00pm (22h semanales)" },
  { value: "flexible", label: "Horario Flexible (máximo 44h semanales)" },
  { value: "remoto", label: "Trabajo Remoto / Teletrabajo (44h semanales)" },
  { value: "hibrido", label: "Híbrido Presencial + Remoto (44h semanales)" },
];
import { format } from "date-fns";
import { hasCompanyAdminAccess, hasGlobalAccess } from "@shared/permissions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, FileText, Calendar, User, Briefcase, AlertCircle, CheckCircle2, Clock, Download, Upload, Users } from "lucide-react";

export default function Contratos() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importResults, setImportResults] = useState<{
    total: number;
    successful: number;
    failed: number;
    errors: Array<{ row: number; error: string; data: any }>;
  } | null>(null);

  const [formData, setFormData] = useState({
    workerId: "",
    identificationNumber: "",
    workerName: "",
    workerEmail: "",
    jobProfileId: "",
    contractType: "indefinido" as "indefinido" | "fijo" | "obra_labor" | "ocasional" | "aprendizaje" | "servicios",
    contractNumber: "",
    startDate: "",
    endDate: "",
    position: "",
    department: "",
    workSchedule: "",
    arlRate: "",
    additionalClauses: "",
    status: "activo" as "activo" | "vencido" | "terminado" | "suspendido",
  });
  
  // Estado separado para el valor del selector de horario
  const [selectedScheduleValue, setSelectedScheduleValue] = useState<string>("none");

  const { data: contracts = [], isLoading } = useQuery<Contract[]>({
    queryKey: ["/api/contracts"],
  });

  const { data: workers = [] } = useQuery<Worker[]>({
    queryKey: ["/api/workers"],
  });

  const { data: jobProfiles = [] } = useQuery<JobProfile[]>({
    queryKey: ["/api/job-profiles"],
  });

  const { data: companies = [] } = useQuery<Company[]>({
    queryKey: ["/api/companies"],
  });

  // For admin: company filter for workers
  const isAdmin = user?.role ? hasCompanyAdminAccess(user.role) : false;
  const isSuperadmin = user?.role ? hasGlobalAccess(user.role) : false;
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");

  // Modo masivo para crear contratos a múltiples trabajadores
  const [creationMode, setCreationMode] = useState<"individual" | "masivo">("individual");
  const [selectedWorkerIds, setSelectedWorkerIds] = useState<string[]>([]);

  const createContractMutation = useMutation({
    mutationFn: async (data: z.infer<typeof insertContractSchema>) => {
      const res = await apiRequest("POST", "/api/contracts", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contracts"] });
      setDialogOpen(false);
      resetForm();
      toast({
        title: "Contrato creado",
        description: "El contrato se ha creado exitosamente",
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

  const updateContractMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<z.infer<typeof insertContractSchema>> }) => {
      const res = await apiRequest("PATCH", `/api/contracts/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contracts"] });
      setDialogOpen(false);
      setEditingContract(null);
      resetForm();
      toast({
        title: "Contrato actualizado",
        description: "El contrato se ha actualizado exitosamente",
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

  const deleteContractMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/contracts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contracts"] });
      toast({
        title: "Contrato eliminado",
        description: "El contrato se ha eliminado exitosamente",
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

  // Mutación para crear contratos en masa
  const batchCreateContractsMutation = useMutation({
    mutationFn: async (data: { workerIds: string[]; contractData: Partial<z.infer<typeof insertContractSchema>> }) => {
      const res = await apiRequest("POST", "/api/contracts/batch", data);
      return res.json();
    },
    onSuccess: (data: { total: number; successful: number; failed: number }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/contracts"] });
      setDialogOpen(false);
      resetForm();
      setSelectedWorkerIds([]);
      setCreationMode("individual");
      toast({
        title: "Contratos creados en masa",
        description: `Se crearon ${data.successful} contratos exitosamente${data.failed > 0 ? `. ${data.failed} fallaron.` : '.'}`,
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

  // Generar número de contrato automático
  const generateContractNumber = () => {
    const year = new Date().getFullYear();
    const count = contracts.length + 1;
    const paddedCount = count.toString().padStart(3, '0');
    return `CT-${year}-${paddedCount}`;
  };

  const resetForm = () => {
    setFormData({
      workerId: "",
      identificationNumber: "",
      workerName: "",
      workerEmail: "",
      jobProfileId: "",
      contractType: "indefinido",
      contractNumber: "",
      startDate: "",
      endDate: "",
      position: "",
      department: "",
      workSchedule: "",
      arlRate: "",
      additionalClauses: "",
      status: "activo",
    });
    setSelectedScheduleValue("none");
  };

  const handleEdit = (contract: Contract) => {
    setEditingContract(contract);
    // Set company for filtering when editing
    const worker = workers.find(w => w.id === contract.workerId);
    if (worker && isAdmin) {
      setSelectedCompanyId(worker.companyId || "");
    }
    setFormData({
      workerId: contract.workerId,
      identificationNumber: contract.identificationNumber || worker?.identificationNumber || "",
      workerName: worker?.name || "",
      workerEmail: worker?.email || "",
      jobProfileId: contract.jobProfileId || "",
      contractType: contract.contractType,
      contractNumber: contract.contractNumber,
      startDate: contract.startDate,
      endDate: contract.endDate || "",
      position: contract.position,
      department: contract.department || "",
      workSchedule: contract.workSchedule || "",
      arlRate: contract.arlRate || "",
      additionalClauses: contract.additionalClauses || "",
      status: contract.status,
    });
    // Buscar si el workSchedule coincide con un horario predefinido
    const matchingSchedule = HORARIOS_PREDEFINIDOS.find(h => h.label === contract.workSchedule);
    if (matchingSchedule) {
      setSelectedScheduleValue(matchingSchedule.value);
    } else if (contract.workSchedule) {
      setSelectedScheduleValue("custom");
    } else {
      setSelectedScheduleValue("none");
    }
    setDialogOpen(true);
  };

  const handleWorkerChange = (workerId: string) => {
    const worker = workers.find(w => w.id === workerId);
    if (worker) {
      // SST-2025-0009: Cargar todos los datos del trabajador incluyendo perfil y fecha de inicio
      // Buscar perfil de cargo que coincida con el cargo del trabajador
      const matchingProfile = jobProfiles.find(p => p.name === worker.position);
      
      setFormData(prev => ({
        ...prev,
        workerId,
        identificationNumber: worker.identificationNumber,
        workerName: worker.name,
        workerEmail: worker.email || "",
        position: worker.position,
        department: worker.department,
        startDate: worker.startDate || "",
        jobProfileId: matchingProfile?.id || "",
      }));
    }
  };

  // Buscar trabajador existente por identificación
  const existingWorker = formData.identificationNumber 
    ? workers.find(w => w.identificationNumber === formData.identificationNumber)
    : null;

  const handleIdentificationChange = (value: string) => {
    const worker = workers.find(w => w.identificationNumber === value);
    if (worker) {
      setFormData(prev => ({
        ...prev,
        identificationNumber: value,
        workerId: worker.id,
        workerName: worker.name,
        workerEmail: worker.email || "",
        position: worker.position || prev.position,
        department: worker.department || prev.department,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        identificationNumber: value,
        workerId: "",
      }));
    }
  };

  // Convertir perfiles predefinidos a formato compatible
  const predefinedProfilesList = useMemo(() => {
    return Object.entries(PREDEFINED_PROFILES).map(([key, profile]) => ({
      id: `predef_${key}`,
      name: profile.name,
      department: profile.department,
      description: profile.description,
      riskClass: profile.riskClass as "I" | "II" | "III" | "IV" | "V",
      isPredefined: true
    }));
  }, []);

  // Perfiles de empresa (BD) filtrados
  const companyJobProfiles = isAdmin && selectedCompanyId 
    ? jobProfiles.filter(p => p.companyId === selectedCompanyId)
    : jobProfiles;

  // Trabajadores filtrados por empresa (para el selector desplegable)
  const filteredWorkers = useMemo(() => {
    if (isAdmin && selectedCompanyId) {
      return workers.filter(w => w.companyId === selectedCompanyId);
    }
    return workers;
  }, [workers, isAdmin, selectedCompanyId]);

  // Extraer cargos únicos de perfiles predefinidos y de la empresa
  const availablePositions = useMemo(() => {
    const positions = new Set<string>();
    
    // Agregar cargos de perfiles predefinidos
    Object.values(PREDEFINED_PROFILES).forEach(profile => {
      positions.add(profile.name);
    });
    
    // Agregar cargos de perfiles de la empresa
    companyJobProfiles.forEach(profile => {
      positions.add(profile.name);
    });
    
    // Agregar cargos de trabajadores existentes
    filteredWorkers.forEach(worker => {
      if (worker.position) positions.add(worker.position);
    });
    
    return Array.from(positions).sort();
  }, [companyJobProfiles, filteredWorkers]);

  // Extraer departamentos únicos (predefinidos + de trabajadores existentes)
  const availableDepartments = useMemo(() => {
    const departments = new Set<string>(DEPARTAMENTOS_PREDEFINIDOS);
    
    // Agregar departamentos de perfiles predefinidos
    Object.values(PREDEFINED_PROFILES).forEach(profile => {
      if (profile.department) departments.add(profile.department);
    });
    
    // Agregar departamentos de trabajadores existentes
    filteredWorkers.forEach(worker => {
      if (worker.department) departments.add(worker.department);
    });
    
    return Array.from(departments).sort();
  }, [filteredWorkers]);

  // Agrupar trabajadores por departamento para selección masiva
  const workersByDepartment = useMemo(() => {
    const grouped: Record<string, Worker[]> = {};
    if (!filteredWorkers || !Array.isArray(filteredWorkers)) return grouped;
    filteredWorkers.forEach(worker => {
      if (!worker || !worker.id) return; // Skip invalid workers
      const dept = worker.department || "Sin Departamento";
      if (!grouped[dept]) grouped[dept] = [];
      grouped[dept].push(worker);
    });
    return grouped;
  }, [filteredWorkers]);

  // Agrupar trabajadores por cargo para selección masiva
  const workersByPosition = useMemo(() => {
    const grouped: Record<string, Worker[]> = {};
    if (!filteredWorkers || !Array.isArray(filteredWorkers)) return grouped;
    filteredWorkers.forEach(worker => {
      if (!worker || !worker.id) return; // Skip invalid workers
      const pos = worker.position || "Sin Cargo";
      if (!grouped[pos]) grouped[pos] = [];
      grouped[pos].push(worker);
    });
    return grouped;
  }, [filteredWorkers]);

  // Funciones de selección masiva
  const toggleWorkerSelection = (workerId: string) => {
    if (!workerId) return;
    setSelectedWorkerIds(prev => {
      const currentIds = prev || [];
      return currentIds.includes(workerId) 
        ? currentIds.filter(id => id !== workerId) 
        : [...currentIds, workerId];
    });
  };

  const toggleDepartmentSelection = (department: string) => {
    try {
      const deptWorkers = workersByDepartment[department] || [];
      if (deptWorkers.length === 0) return;
      
      const validWorkers = deptWorkers.filter(w => w && w.id);
      const allSelected = validWorkers.every(w => (selectedWorkerIds || []).includes(w.id));
      
      if (allSelected) {
        setSelectedWorkerIds(prev => (prev || []).filter(id => !validWorkers.some(w => w.id === id)));
      } else {
        const newIds = validWorkers.map(w => w.id).filter(id => id && !(selectedWorkerIds || []).includes(id));
        setSelectedWorkerIds(prev => [...(prev || []), ...newIds]);
      }
    } catch (error) {
      console.error("Error en toggleDepartmentSelection:", error);
    }
  };

  const togglePositionSelection = (position: string) => {
    try {
      const posWorkers = workersByPosition[position] || [];
      if (posWorkers.length === 0) return;
      
      const validWorkers = posWorkers.filter(w => w && w.id);
      const allSelected = validWorkers.every(w => (selectedWorkerIds || []).includes(w.id));
      
      if (allSelected) {
        setSelectedWorkerIds(prev => (prev || []).filter(id => !validWorkers.some(w => w.id === id)));
      } else {
        const newIds = validWorkers.map(w => w.id).filter(id => id && !(selectedWorkerIds || []).includes(id));
        setSelectedWorkerIds(prev => [...(prev || []), ...newIds]);
      }
    } catch (error) {
      console.error("Error en togglePositionSelection:", error);
    }
  };

  const selectAllWorkers = () => {
    if (!filteredWorkers || !Array.isArray(filteredWorkers)) return;
    const validIds = filteredWorkers.filter(w => w && w.id).map(w => w.id);
    setSelectedWorkerIds(validIds);
  };

  const deselectAllWorkers = () => {
    setSelectedWorkerIds([]);
  };

  // Contadores para botones de selección rápida
  const getDepartmentSelectionCount = (department: string) => {
    const deptWorkers = workersByDepartment[department] || [];
    const validWorkers = deptWorkers.filter(w => w && w.id);
    const currentIds = selectedWorkerIds || [];
    const selectedCount = validWorkers.filter(w => currentIds.includes(w.id)).length;
    return { selected: selectedCount, total: validWorkers.length };
  };

  const getPositionSelectionCount = (position: string) => {
    const posWorkers = workersByPosition[position] || [];
    const validWorkers = posWorkers.filter(w => w && w.id);
    const currentIds = selectedWorkerIds || [];
    const selectedCount = validWorkers.filter(w => currentIds.includes(w.id)).length;
    return { selected: selectedCount, total: validWorkers.length };
  };

  const handleJobProfileChange = (profileId: string) => {
    if (profileId === "none") {
      setFormData(prev => ({ 
        ...prev, 
        jobProfileId: "",
        arlRate: "",
      }));
      return;
    }
    
    // Buscar primero en perfiles de BD
    let profile = jobProfiles.find(p => p.id === profileId);
    let isPredefined = false;
    
    // Si no está en BD, buscar en predefinidos
    if (!profile && profileId.startsWith("predef_")) {
      const predefKey = profileId.replace("predef_", "");
      const predefProfile = PREDEFINED_PROFILES[predefKey];
      if (predefProfile) {
        profile = {
          id: profileId,
          name: predefProfile.name,
          department: predefProfile.department,
          description: predefProfile.description,
          riskClass: predefProfile.riskClass as "I" | "II" | "III" | "IV" | "V",
        } as any;
        isPredefined = true;
      }
    }
    
    if (profile) {
      const arlRate = getArlRateFormatted(profile.riskClass);
      // Para perfiles predefinidos usamos el department del profile, para BD mantenemos el existente
      const profileDepartment = isPredefined ? (profile as any).department : null;
      setFormData(prev => ({ 
        ...prev, 
        jobProfileId: isPredefined ? "" : profileId, // No guardar ID de predefinido en BD
        arlRate,
        position: profile!.name,
        department: profileDepartment || prev.department
      }));
      
      toast({
        title: isPredefined ? "Perfil predefinido aplicado" : "Perfil de cargo aplicado",
        description: `Cargo: ${profile.name} | Clase de Riesgo: ${profile.riskClass} | Tasa ARL: ${arlRate}`,
        className: "bg-yellow-50 border-yellow-200",
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones de fecha según tipo de contrato
    if (formData.contractType === "fijo" && !formData.endDate) {
      toast({
        title: "Error de validación",
        description: "Los contratos a término fijo requieren fecha de finalización",
        variant: "destructive",
      });
      return;
    }

    if (formData.contractType === "fijo" && formData.endDate) {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      const durationYears = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
      
      if (durationYears > 4) {
        toast({
          title: "Error de validación",
          description: "Los contratos a término fijo no pueden exceder 4 años según Ley 2466/2025",
          variant: "destructive",
        });
        return;
      }
    }

    if (formData.contractType === "ocasional" && formData.endDate) {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      const durationDays = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
      
      if (durationDays > 30) {
        toast({
          title: "Error de validación",
          description: "Los contratos ocasionales no pueden exceder 30 días",
          variant: "destructive",
        });
        return;
      }
    }

    // Modo masivo: crear contratos para múltiples trabajadores
    if (creationMode === "masivo") {
      if (selectedWorkerIds.length === 0) {
        toast({
          title: "Error de validación",
          description: "Debe seleccionar al menos un trabajador para creación masiva",
          variant: "destructive",
        });
        return;
      }

      if (!formData.startDate) {
        toast({
          title: "Error de validación",
          description: "La fecha de contrato es requerida",
          variant: "destructive",
        });
        return;
      }

      const contractData = {
        contractType: formData.contractType,
        startDate: formData.startDate,
        endDate: formData.endDate || undefined,
        position: formData.position || undefined,
        department: formData.department || undefined,
        workSchedule: formData.workSchedule || undefined,
        arlRate: formData.arlRate || undefined,
        additionalClauses: formData.additionalClauses || undefined,
        jobProfileId: formData.jobProfileId || undefined,
        companyId: isAdmin ? selectedCompanyId : undefined,
      };

      batchCreateContractsMutation.mutate({
        workerIds: selectedWorkerIds,
        contractData,
      });
      return;
    }

    // Modo individual (original)
    // Validar campos de trabajador para nuevos contratos
    if (!editingContract && !existingWorker && !formData.workerName) {
      toast({
        title: "Error de validación",
        description: "Nombre del trabajador es requerido",
        variant: "destructive",
      });
      return;
    }

    const dataToSubmit = {
      ...formData,
      identificationNumber: formData.identificationNumber || undefined,
      workerName: formData.workerName || undefined,
      workerEmail: formData.workerEmail || undefined,
      jobProfileId: formData.jobProfileId || undefined,
      endDate: formData.endDate || undefined,
      department: formData.department || undefined,
      workSchedule: formData.workSchedule || undefined,
      additionalClauses: formData.additionalClauses || undefined,
      companyId: isAdmin ? selectedCompanyId : undefined,
    };

    if (editingContract) {
      updateContractMutation.mutate({ id: editingContract.id, data: dataToSubmit });
    } else {
      createContractMutation.mutate(dataToSubmit);
    }
  };

  // Bulk import functions
  const handleDownloadTemplate = async () => {
    try {
      const url = isAdmin && selectedCompanyId 
        ? `/api/contracts/template/download?companyId=${selectedCompanyId}`
        : '/api/contracts/template/download';
      
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
      a.download = 'plantilla_contratos.xlsx';
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
      const formData = new FormData();
      formData.append('file', file);
      if (isAdmin && selectedCompanyId) {
        formData.append('companyId', selectedCompanyId);
      }

      const response = await fetch('/api/contracts/import', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al importar contratos');
      }

      return response.json();
    },
    onSuccess: (data) => {
      setImportResults(data);
      queryClient.invalidateQueries({ queryKey: ["/api/contracts"] });
      
      if (data.failed === 0) {
        toast({
          title: "Importación exitosa",
          description: `Se importaron ${data.successful} contratos correctamente`,
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

  const filteredContracts = contracts.filter(contract => {
    const worker = workers.find(w => w.id === contract.workerId);
    return (
      contract.contractNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      worker?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const getStatusColor = (status: string) => {
    const colors = {
      "activo": "bg-green-500",
      "vencido": "bg-orange-500",
      "terminado": "bg-red-500",
      "suspendido": "bg-yellow-500"
    };
    return colors[status as keyof typeof colors] || "bg-gray-500";
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Cargando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <BackToCronogramaButton />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Contratos Laborales</h1>
          <p className="text-muted-foreground">Gestión de contratos según legislación colombiana 2025</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button onClick={handleDownloadTemplate} variant="outline" data-testid="button-download-template">
            <Download className="h-4 w-4 mr-2" />
            Descargar Plantilla
          </Button>
          <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" data-testid="button-import-contracts">
                <Upload className="h-4 w-4 mr-2" />
                Importar Excel
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Importar Contratos</DialogTitle>
                <DialogDescription>
                  Suba un archivo Excel con los contratos a importar.
                  Descargue primero la plantilla para ver el formato requerido.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {isSuperadmin && (
                  <div className="space-y-2">
                    <Label>Empresa destino</Label>
                    <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
                      <SelectTrigger>
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
                  <Label htmlFor="importFile">Archivo Excel</Label>
                  <Input
                    id="importFile"
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileSelect}
                    data-testid="input-import-file"
                  />
                </div>
                {selectedFile && (
                  <div className="p-3 bg-muted rounded-md">
                    <p className="text-sm">Archivo seleccionado: {selectedFile.name}</p>
                  </div>
                )}
                {importResults && (
                  <div className="space-y-2">
                    <div className="flex gap-4 text-sm">
                      <span className="text-green-600">Exitosos: {importResults.successful}</span>
                      <span className="text-red-600">Fallidos: {importResults.failed}</span>
                      <span className="text-muted-foreground">Total: {importResults.total}</span>
                    </div>
                    {importResults.errors.length > 0 && (
                      <div className="mt-2 p-2 bg-destructive/10 rounded-md max-h-40 overflow-y-auto">
                        <p className="text-sm font-semibold text-destructive mb-1">Errores:</p>
                        {importResults.errors.map((err, idx) => (
                          <p key={idx} className="text-xs text-destructive">
                            Fila {err.row}: {err.error}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={handleResetImport}>
                  Cancelar
                </Button>
                <Button 
                  onClick={handleImport} 
                  disabled={!selectedFile || importMutation.isPending || (isAdmin && !selectedCompanyId)}
                  data-testid="button-submit-import"
                >
                  {importMutation.isPending ? "Importando..." : "Importar"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setEditingContract(null);
            resetForm();
            setSelectedCompanyId("");
          }
        }}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-contract">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Contrato
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingContract ? "Editar Contrato" : "Nuevo Contrato Laboral"}</DialogTitle>
              <DialogDescription>
                Complete la información del contrato según CST y Ley 2466/2025
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                {/* Selector de Empresa para filtrar trabajadores */}
                {isSuperadmin && (
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="companyFilter">Empresa *</Label>
                    <Select
                      value={selectedCompanyId}
                      onValueChange={(value) => {
                        setSelectedCompanyId(value);
                        setFormData(prev => ({ ...prev, workerId: "", identificationNumber: "", workerName: "", workerEmail: "" }));
                        setSelectedWorkerIds([]);
                      }}
                    >
                      <SelectTrigger id="companyFilter" data-testid="select-company-filter">
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
                  </div>
                )}

                {/* Toggle Modo Individual/Masivo - solo para nuevos contratos */}
                {!editingContract && filteredWorkers.length > 0 && (
                  <div className="col-span-2">
                    <Label className="mb-2 block">Modo de Creación</Label>
                    <Tabs 
                      value={creationMode} 
                      onValueChange={(v) => {
                        setCreationMode(v as "individual" | "masivo");
                        setSelectedWorkerIds([]);
                        setFormData(prev => ({ ...prev, workerId: "", identificationNumber: "", workerName: "", workerEmail: "" }));
                      }}
                      className="w-full"
                    >
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="individual" data-testid="tab-individual">
                          <User className="h-4 w-4 mr-2" />
                          Individual
                        </TabsTrigger>
                        <TabsTrigger value="masivo" data-testid="tab-masivo">
                          <Users className="h-4 w-4 mr-2" />
                          Masivo ({filteredWorkers.length} trabajadores)
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                    <p className="text-xs text-muted-foreground mt-1">
                      {creationMode === "individual" 
                        ? "Crear contrato para un solo trabajador" 
                        : "Crear contratos para múltiples trabajadores con los mismos parámetros"}
                    </p>
                  </div>
                )}

                {/* MODO MASIVO: Selección de múltiples trabajadores */}
                {creationMode === "masivo" && !editingContract && (
                  <div className="col-span-2 space-y-4 border rounded-lg p-4 bg-muted/30">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-medium">Seleccionar Trabajadores</Label>
                        <p className="text-sm text-muted-foreground">
                          {selectedWorkerIds.length} de {filteredWorkers.length} seleccionados
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button type="button" variant="outline" size="sm" onClick={selectAllWorkers}>
                          Seleccionar Todos
                        </Button>
                        <Button type="button" variant="outline" size="sm" onClick={deselectAllWorkers}>
                          Deseleccionar
                        </Button>
                      </div>
                    </div>

                    {/* Selección rápida por Departamento */}
                    {Object.keys(workersByDepartment).length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Selección Rápida por Departamento</Label>
                        <div className="flex flex-wrap gap-2">
                          {Object.keys(workersByDepartment).sort().map(dept => {
                            const { selected, total } = getDepartmentSelectionCount(dept);
                            const isFullySelected = selected === total;
                            return (
                              <Button
                                key={dept}
                                type="button"
                                variant={isFullySelected ? "default" : "outline"}
                                size="sm"
                                onClick={() => toggleDepartmentSelection(dept)}
                                className="text-xs"
                                data-testid={`btn-dept-${dept}`}
                              >
                                {dept} ({selected}/{total})
                              </Button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Selección rápida por Cargo */}
                    {Object.keys(workersByPosition).length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Selección Rápida por Cargo</Label>
                        <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                          {Object.keys(workersByPosition).sort().map(pos => {
                            const { selected, total } = getPositionSelectionCount(pos);
                            const isFullySelected = selected === total;
                            return (
                              <Button
                                key={pos}
                                type="button"
                                variant={isFullySelected ? "default" : "outline"}
                                size="sm"
                                onClick={() => togglePositionSelection(pos)}
                                className="text-xs"
                                data-testid={`btn-pos-${pos}`}
                              >
                                {pos} ({selected}/{total})
                              </Button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Lista de trabajadores con checkboxes */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Trabajadores</Label>
                      <ScrollArea className="h-48 border rounded-md p-2">
                        <div className="space-y-1">
                          {filteredWorkers.map(worker => (
                            <div 
                              key={worker.id} 
                              className={`flex items-center space-x-2 p-2 rounded hover-elevate cursor-pointer ${
                                selectedWorkerIds.includes(worker.id) ? "bg-primary/10" : ""
                              }`}
                              onClick={() => toggleWorkerSelection(worker.id)}
                            >
                              <Checkbox
                                checked={selectedWorkerIds.includes(worker.id)}
                                onCheckedChange={() => toggleWorkerSelection(worker.id)}
                                data-testid={`check-worker-${worker.id}`}
                              />
                              <div className="flex-1 text-sm">
                                <span className="font-medium">{worker.name}</span>
                                <span className="text-muted-foreground ml-2">
                                  {worker.identificationNumber}
                                </span>
                                {worker.position && (
                                  <Badge variant="secondary" className="ml-2 text-xs">
                                    {worker.position}
                                  </Badge>
                                )}
                                {worker.department && (
                                  <span className="text-muted-foreground text-xs ml-2">
                                    | {worker.department}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  </div>
                )}

                {/* MODO INDIVIDUAL: Selector de Trabajador Existente */}
                {creationMode === "individual" && (
                  <div className="space-y-2 col-span-2">
                    <div className="flex items-center gap-2">
                      <Label>Seleccionar Trabajador *</Label>
                      {existingWorker && (
                        <Badge variant="secondary" className="text-xs">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Trabajador existente
                        </Badge>
                      )}
                    </div>
                    <Select
                      value={formData.workerId || "new"}
                      onValueChange={(value) => {
                        if (value === "new") {
                          setFormData(prev => ({
                            ...prev,
                            workerId: "",
                            identificationNumber: "",
                            workerName: "",
                            workerEmail: "",
                          }));
                        } else {
                          handleWorkerChange(value);
                        }
                      }}
                      disabled={isAdmin && !selectedCompanyId}
                    >
                      <SelectTrigger data-testid="select-worker">
                        <SelectValue placeholder="Seleccione un trabajador o cree uno nuevo" />
                      </SelectTrigger>
                      <SelectContent className="max-h-80">
                        <SelectItem value="new">
                          <span className="flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                          Crear nuevo trabajador
                        </span>
                      </SelectItem>
                      {filteredWorkers.length > 0 && (
                        <>
                          <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground bg-muted/50">
                            Trabajadores Registrados ({filteredWorkers.length})
                          </div>
                          {filteredWorkers.map((worker) => (
                            <SelectItem key={worker.id} value={worker.id}>
                              {worker.identificationNumber} - {worker.name}
                            </SelectItem>
                          ))}
                        </>
                      )}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Seleccione un trabajador existente o cree uno nuevo
                  </p>

                  {/* Campos de nuevo trabajador - solo si no seleccionó trabajador existente */}
                  {!formData.workerId && (
                    <>
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div className="space-y-2">
                          <Label htmlFor="identificationNumber">Cédula / Identificación *</Label>
                          <Input
                            id="identificationNumber"
                            value={formData.identificationNumber}
                            onChange={(e) => handleIdentificationChange(e.target.value)}
                            placeholder="Ej: 1234567890"
                            required={!formData.workerId}
                            data-testid="input-identification-number"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="workerName">Nombre Completo *</Label>
                          <Input
                            id="workerName"
                            value={formData.workerName}
                            onChange={(e) => setFormData({ ...formData, workerName: e.target.value })}
                            placeholder="Ej: Juan Pérez García"
                            required={!formData.workerId}
                            data-testid="input-worker-name"
                          />
                        </div>
                      </div>
                    </>
                  )}
                  
                  <div className="space-y-2 mt-4">
                    <Label htmlFor="workerEmail">Email del Trabajador</Label>
                    <Input
                      id="workerEmail"
                      type="email"
                      value={formData.workerEmail}
                      onChange={(e) => setFormData({ ...formData, workerEmail: e.target.value })}
                      placeholder="correo@ejemplo.com"
                      readOnly={!!formData.workerId}
                      className={formData.workerId ? "bg-muted" : ""}
                      data-testid="input-worker-email"
                    />
                    <p className="text-xs text-muted-foreground">
                      Para notificaciones de exámenes y capacitaciones
                    </p>
                  </div>
                </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="jobProfileId">Perfil de Cargo</Label>
                  <Select
                    value={formData.jobProfileId || "none"}
                    onValueChange={handleJobProfileChange}
                  >
                    <SelectTrigger id="jobProfileId" data-testid="select-job-profile">
                      <SelectValue placeholder="Seleccionar perfil (opcional)" />
                    </SelectTrigger>
                    <SelectContent className="max-h-80">
                      <SelectItem value="none">-- Sin perfil de cargo --</SelectItem>
                      
                      {companyJobProfiles.length > 0 && (
                        <>
                          <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground bg-muted/50">
                            Perfiles de la Empresa
                          </div>
                          {companyJobProfiles.map((profile) => (
                            <SelectItem key={profile.id} value={profile.id}>
                              {profile.name} - Clase {profile.riskClass}
                            </SelectItem>
                          ))}
                        </>
                      )}
                      
                      <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground bg-muted/50">
                        Perfiles Predefinidos ({predefinedProfilesList.length} cargos)
                      </div>
                      {predefinedProfilesList.map((profile) => (
                        <SelectItem key={profile.id} value={profile.id}>
                          {profile.name} - Clase {profile.riskClass}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Al seleccionar un perfil se auto-completa cargo, tasa ARL y departamento
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contractNumber">Número de Contrato</Label>
                  <Input
                    id="contractNumber"
                    value={formData.contractNumber}
                    onChange={(e) => setFormData({ ...formData, contractNumber: e.target.value })}
                    placeholder="Generado automáticamente"
                    data-testid="input-contract-number"
                    readOnly={!editingContract}
                    className={!editingContract ? "bg-muted" : ""}
                  />
                  <p className="text-xs text-muted-foreground">
                    {!editingContract 
                      ? "Se genera automáticamente: CONT-XXXXXX-2025-0001" 
                      : "Puede modificar el número de contrato si es necesario"}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contractType">Tipo de Contrato *</Label>
                  <Select
                    value={formData.contractType}
                    onValueChange={(value: any) => setFormData({ ...formData, contractType: value })}
                  >
                    <SelectTrigger id="contractType" data-testid="select-contract-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="indefinido">Término Indefinido (Preferente)</SelectItem>
                      <SelectItem value="fijo">Término Fijo (Máx 4 años)</SelectItem>
                      <SelectItem value="obra_labor">Obra o Labor</SelectItem>
                      <SelectItem value="ocasional">Ocasional (Máx 30 días)</SelectItem>
                      <SelectItem value="aprendizaje">Aprendizaje</SelectItem>
                      <SelectItem value="servicios">Prestación de Servicios</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="startDate">Fecha de Contrato *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                    data-testid="input-start-date"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">
                    Fecha de Finalización {formData.contractType === "fijo" && "*"}
                  </Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    required={formData.contractType === "fijo"}
                    disabled={formData.contractType === "indefinido"}
                    data-testid="input-end-date"
                  />
                  {formData.contractType === "indefinido" && (
                    <p className="text-xs text-muted-foreground">
                      No aplica para contratos indefinidos
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="arlRate">Tasa ARL (%)</Label>
                  <Input
                    id="arlRate"
                    value={formData.arlRate}
                    readOnly
                    className="bg-muted"
                    placeholder="Se calcula automáticamente"
                    data-testid="input-arl-rate"
                  />
                  <p className="text-xs text-muted-foreground">
                    Se calcula automáticamente al seleccionar perfil de cargo
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="position">Cargo *</Label>
                  <Select
                    value={formData.position || "custom"}
                    onValueChange={(value) => {
                      if (value === "custom") {
                        setFormData({ ...formData, position: "" });
                      } else {
                        setFormData({ ...formData, position: value });
                      }
                    }}
                  >
                    <SelectTrigger id="position" data-testid="select-position">
                      <SelectValue placeholder="Seleccione un cargo" />
                    </SelectTrigger>
                    <SelectContent className="max-h-80">
                      <SelectItem value="custom">
                        <span className="text-muted-foreground">-- Escribir cargo personalizado --</span>
                      </SelectItem>
                      <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground bg-muted/50">
                        Cargos Disponibles ({availablePositions.length})
                      </div>
                      {availablePositions.map((position) => (
                        <SelectItem key={position} value={position}>
                          {position}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formData.position === "" && (
                    <Input
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                      placeholder="Escriba el cargo personalizado"
                      className="mt-2"
                      data-testid="input-custom-position"
                    />
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Departamento</Label>
                  <Select
                    value={formData.department || "none"}
                    onValueChange={(value) => {
                      if (value === "none") {
                        setFormData({ ...formData, department: "" });
                      } else {
                        setFormData({ ...formData, department: value });
                      }
                    }}
                  >
                    <SelectTrigger id="department" data-testid="select-department">
                      <SelectValue placeholder="Seleccione un departamento" />
                    </SelectTrigger>
                    <SelectContent className="max-h-80">
                      <SelectItem value="none">-- Sin departamento --</SelectItem>
                      <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground bg-muted/50">
                        Departamentos ({availableDepartments.length})
                      </div>
                      {availableDepartments.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="workSchedule">Horario de Trabajo</Label>
                  <Select
                    value={selectedScheduleValue}
                    onValueChange={(value) => {
                      setSelectedScheduleValue(value);
                      if (value === "none") {
                        setFormData({ ...formData, workSchedule: "" });
                      } else if (value === "custom") {
                        setFormData({ ...formData, workSchedule: "" });
                      } else {
                        const horario = HORARIOS_PREDEFINIDOS.find(h => h.value === value);
                        setFormData({ ...formData, workSchedule: horario?.label || value });
                      }
                    }}
                  >
                    <SelectTrigger id="workSchedule" data-testid="select-work-schedule">
                      <SelectValue placeholder="Seleccione el horario de trabajo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">-- Sin horario definido --</SelectItem>
                      <SelectItem value="custom">
                        <span className="text-muted-foreground">-- Escribir horario personalizado --</span>
                      </SelectItem>
                      <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground bg-muted/50">
                        Horarios Predefinidos (Ley 2101/2021 - 44h semanales)
                      </div>
                      {HORARIOS_PREDEFINIDOS.map((horario) => (
                        <SelectItem key={horario.value} value={horario.value}>
                          {horario.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedScheduleValue === "custom" && (
                    <Input
                      value={formData.workSchedule}
                      onChange={(e) => setFormData({ ...formData, workSchedule: e.target.value })}
                      placeholder="Escriba el horario personalizado (ej: Lunes a Viernes 9:00am - 5:48pm)"
                      className="mt-2"
                      data-testid="input-custom-schedule"
                    />
                  )}
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="additionalClauses">Cláusulas Adicionales</Label>
                  <Textarea
                    id="additionalClauses"
                    value={formData.additionalClauses}
                    onChange={(e) => setFormData({ ...formData, additionalClauses: e.target.value })}
                    placeholder="Información adicional del contrato"
                    rows={3}
                    data-testid="input-additional-clauses"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Estado del Contrato</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger id="status" data-testid="select-status">
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
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setDialogOpen(false);
                    setEditingContract(null);
                    resetForm();
                  }}
                  data-testid="button-cancel"
                >
                  Cancelar
                </Button>
                <Button type="submit" data-testid="button-save">
                  {editingContract ? "Actualizar" : "Crear"} Contrato
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Input
          placeholder="Buscar contrato..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
          data-testid="input-search"
        />
      </div>

      {filteredContracts.length === 0 ? (
        <div className="text-center text-muted-foreground py-12">
          No hay contratos registrados
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredContracts.map((contract) => {
            const worker = workers.find(w => w.id === contract.workerId);
            const profile = jobProfiles.find(p => p.id === contract.jobProfileId);
            
            return (
              <Card key={contract.id} className="hover-elevate" data-testid={`card-contract-${contract.id}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1">
                      <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      <CardTitle className="text-base">{contract.contractNumber}</CardTitle>
                    </div>
                    <Badge className={`${getStatusColor(contract.status)} text-white flex-shrink-0`}>
                      {contract.status}
                    </Badge>
                  </div>
                  <CardDescription>{worker?.name || "Sin trabajador"}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="font-semibold">{contract.position}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-muted-foreground">{contractTypeLabels[contract.contractType]}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-muted-foreground">
                        {format(new Date(contract.startDate), "dd/MM/yyyy")}
                        {contract.endDate && ` - ${format(new Date(contract.endDate), "dd/MM/yyyy")}`}
                      </span>
                    </div>
                    {contract.arlRate && (
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          ARL: {contract.arlRate}
                        </Badge>
                      </div>
                    )}
                    {profile && (
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-xs text-muted-foreground">
                          {profile.name} - Clase {profile.riskClass}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleEdit(contract)}
                      data-testid={`button-edit-${contract.id}`}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        if (confirm("¿Está seguro de eliminar este contrato?")) {
                          deleteContractMutation.mutate(contract.id);
                        }
                      }}
                      data-testid={`button-delete-${contract.id}`}
                    >
                      Eliminar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
