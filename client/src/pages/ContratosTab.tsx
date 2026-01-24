import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Contract, Worker, JobProfile } from "@shared/schema";
import { insertContractSchema } from "@shared/schema";
import { contractTypeLabels, getArlRateFormatted } from "@shared/arl-rates";
import type { z } from "zod";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Plus, 
  FileText, 
  Calendar, 
  DollarSign, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Users, 
  ChevronUp, 
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BackToCronogramaButton } from "@/components/BackToCronogramaButton";

type ContractType = "indefinido" | "fijo" | "obra_labor" | "ocasional" | "aprendizaje" | "servicios";
type ContractStatus = "activo" | "vencido" | "terminado" | "suspendido";
type SortField = "contractNumber" | "workerName" | "position" | "contractType" | "startDate" | "endDate" | "salary" | "status";
type SortDirection = "asc" | "desc";

const ITEMS_PER_PAGE = 20;

const statusColors: Record<ContractStatus, string> = {
  activo: "bg-green-500 text-white",
  vencido: "bg-orange-500 text-white",
  terminado: "bg-red-500 text-white",
  suspendido: "bg-yellow-500 text-black",
};

export default function Contratos() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);
  
  // Table states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedContracts, setSelectedContracts] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>("contractNumber");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  
  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [filterContractType, setFilterContractType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterDepartment, setFilterDepartment] = useState<string>("all");
  const [filterStartDateFrom, setFilterStartDateFrom] = useState("");
  const [filterStartDateTo, setFilterStartDateTo] = useState("");
  
  // Bulk creation states
  const [bulkWorkerIds, setBulkWorkerIds] = useState<Set<string>>(new Set());
  const [bulkWorkerSearch, setBulkWorkerSearch] = useState("");
  const [bulkDepartmentFilter, setBulkDepartmentFilter] = useState<string>("all");

  // Form data
  const [formData, setFormData] = useState({
    workerId: "",
    identificationNumber: "",
    jobProfileId: "",
    contractType: "indefinido" as ContractType,
    contractNumber: "",
    startDate: "",
    endDate: "",
    salary: "" as number | string,
    position: "",
    department: "",
    workSchedule: "",
    arlRate: "",
    additionalClauses: "",
    status: "activo" as ContractStatus,
  });

  // Bulk form data (common fields for all selected workers)
  const [bulkFormData, setBulkFormData] = useState({
    jobProfileId: "",
    contractType: "indefinido" as ContractType,
    startDate: "",
    endDate: "",
    salary: "" as number | string,
    position: "",
    department: "",
    workSchedule: "",
    arlRate: "",
  });

  // Queries
  const { data: contracts = [], isLoading } = useQuery<Contract[]>({
    queryKey: ["/api/contracts"],
  });

  const { data: workers = [] } = useQuery<Worker[]>({
    queryKey: ["/api/workers"],
  });

  const { data: jobProfiles = [] } = useQuery<JobProfile[]>({
    queryKey: ["/api/job-profiles"],
  });

  // Get unique departments from workers
  const departments = useMemo(() => {
    const deptSet = new Set(workers.map(w => w.department).filter(Boolean));
    return Array.from(deptSet).sort();
  }, [workers]);

  // Get workers without active contracts (for bulk creation)
  const workersWithoutActiveContract = useMemo(() => {
    const activeContractWorkerIds = new Set(
      contracts.filter(c => c.status === "activo").map(c => c.workerId)
    );
    return workers.filter(w => !activeContractWorkerIds.has(w.id));
  }, [workers, contracts]);

  // Filtered workers for bulk creation modal
  const filteredWorkersForBulk = useMemo(() => {
    return workersWithoutActiveContract.filter(w => {
      const matchesSearch = 
        w.name.toLowerCase().includes(bulkWorkerSearch.toLowerCase()) ||
        w.identificationNumber.includes(bulkWorkerSearch);
      const matchesDept = bulkDepartmentFilter === "all" || w.department === bulkDepartmentFilter;
      return matchesSearch && matchesDept;
    });
  }, [workersWithoutActiveContract, bulkWorkerSearch, bulkDepartmentFilter]);

  // Process contracts with worker names for sorting/filtering
  const processedContracts = useMemo(() => {
    return contracts.map(contract => {
      const worker = workers.find(w => w.id === contract.workerId);
      return {
        ...contract,
        workerName: worker?.name || "Sin trabajador",
        workerDepartment: worker?.department || "",
      };
    });
  }, [contracts, workers]);

  // Apply filters
  const filteredContracts = useMemo(() => {
    return processedContracts.filter(contract => {
      // Search filter
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        contract.contractNumber.toLowerCase().includes(searchLower) ||
        contract.position.toLowerCase().includes(searchLower) ||
        contract.workerName.toLowerCase().includes(searchLower);

      // Contract type filter
      const matchesType = filterContractType === "all" || contract.contractType === filterContractType;

      // Status filter
      const matchesStatus = filterStatus === "all" || contract.status === filterStatus;

      // Department filter
      const matchesDepartment = filterDepartment === "all" || 
        contract.department === filterDepartment ||
        contract.workerDepartment === filterDepartment;

      // Date range filter
      let matchesDateRange = true;
      if (filterStartDateFrom) {
        matchesDateRange = matchesDateRange && contract.startDate >= filterStartDateFrom;
      }
      if (filterStartDateTo) {
        matchesDateRange = matchesDateRange && contract.startDate <= filterStartDateTo;
      }

      return matchesSearch && matchesType && matchesStatus && matchesDepartment && matchesDateRange;
    });
  }, [processedContracts, searchTerm, filterContractType, filterStatus, filterDepartment, filterStartDateFrom, filterStartDateTo]);

  // Sort contracts
  const sortedContracts = useMemo(() => {
    return [...filteredContracts].sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortField) {
        case "contractNumber":
          aValue = a.contractNumber;
          bValue = b.contractNumber;
          break;
        case "workerName":
          aValue = a.workerName;
          bValue = b.workerName;
          break;
        case "position":
          aValue = a.position;
          bValue = b.position;
          break;
        case "contractType":
          aValue = a.contractType;
          bValue = b.contractType;
          break;
        case "startDate":
          aValue = a.startDate;
          bValue = b.startDate;
          break;
        case "endDate":
          aValue = a.endDate || "";
          bValue = b.endDate || "";
          break;
        case "salary":
          aValue = a.salary || 0;
          bValue = b.salary || 0;
          break;
        case "status":
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          aValue = a.contractNumber;
          bValue = b.contractNumber;
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        const comparison = aValue.localeCompare(bValue);
        return sortDirection === "asc" ? comparison : -comparison;
      }
      
      const comparison = (aValue as number) - (bValue as number);
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [filteredContracts, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(sortedContracts.length / ITEMS_PER_PAGE);
  const paginatedContracts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedContracts.slice(start, start + ITEMS_PER_PAGE);
  }, [sortedContracts, currentPage]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterContractType, filterStatus, filterDepartment, filterStartDateFrom, filterStartDateTo]);

  // Mutations
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
      setSelectedContracts(new Set());
      toast({
        title: "Contrato eliminado",
        description: "El contrato se ha eliminado exitosamente",
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

  const batchCreateMutation = useMutation({
    mutationFn: async (data: { workerIds: string[]; contractData: any }) => {
      const res = await apiRequest("POST", "/api/contracts/batch", data);
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/contracts"] });
      setBulkDialogOpen(false);
      setBulkWorkerIds(new Set());
      resetBulkForm();
      toast({
        title: "Contratos creados",
        description: `Se han creado ${data.created || bulkWorkerIds.size} contratos exitosamente`,
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

  const resetForm = () => {
    setFormData({
      workerId: "",
      identificationNumber: "",
      jobProfileId: "",
      contractType: "indefinido",
      contractNumber: "",
      startDate: "",
      endDate: "",
      salary: "",
      position: "",
      department: "",
      workSchedule: "",
      arlRate: "",
      additionalClauses: "",
      status: "activo",
    });
  };

  const resetBulkForm = () => {
    setBulkFormData({
      jobProfileId: "",
      contractType: "indefinido",
      startDate: "",
      endDate: "",
      salary: "",
      position: "",
      department: "",
      workSchedule: "",
      arlRate: "",
    });
  };

  const handleEdit = (contract: Contract) => {
    setEditingContract(contract);
    setFormData({
      workerId: contract.workerId,
      identificationNumber: contract.identificationNumber || "",
      jobProfileId: contract.jobProfileId || "",
      contractType: contract.contractType as ContractType,
      contractNumber: contract.contractNumber,
      startDate: contract.startDate,
      endDate: contract.endDate || "",
      salary: contract.salary ?? "",
      position: contract.position,
      department: contract.department || "",
      workSchedule: contract.workSchedule || "",
      arlRate: contract.arlRate || "",
      additionalClauses: contract.additionalClauses || "",
      status: contract.status as ContractStatus,
    });
    setDialogOpen(true);
  };

  const handleJobProfileChange = (profileId: string) => {
    const profile = jobProfiles.find(p => p.id === profileId);
    if (profile) {
      const arlRate = getArlRateFormatted(profile.riskClass);
      setFormData(prev => ({
        ...prev,
        jobProfileId: profileId,
        arlRate,
        position: profile.name,
        department: profile.name.includes("Dirección") ? "Dirección" : prev.department,
      }));
    }
  };

  const handleBulkJobProfileChange = (profileId: string) => {
    const profile = jobProfiles.find(p => p.id === profileId);
    if (profile) {
      const arlRate = getArlRateFormatted(profile.riskClass);
      setBulkFormData(prev => ({
        ...prev,
        jobProfileId: profileId,
        arlRate,
        position: profile.name,
      }));
    }
  };

  const validateContractDates = (contractType: ContractType, startDate: string, endDate: string): string | null => {
    if (contractType === "fijo" && !endDate) {
      return "Los contratos a término fijo requieren fecha de finalización";
    }

    if (contractType === "fijo" && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const durationYears = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365);
      if (durationYears > 4) {
        return "Los contratos a término fijo no pueden exceder 4 años según Ley 2466/2025";
      }
    }

    if (contractType === "ocasional" && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const durationDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
      if (durationDays > 30) {
        return "Los contratos ocasionales no pueden exceder 30 días";
      }
    }

    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateContractDates(formData.contractType, formData.startDate, formData.endDate);
    if (validationError) {
      toast({
        title: "Error de validación",
        description: validationError,
        variant: "destructive",
      });
      return;
    }

    const salaryValue = formData.salary === '' ? 0 : Number(formData.salary);
    const dataToSubmit = {
      ...formData,
      salary: salaryValue,
      identificationNumber: formData.identificationNumber || undefined,
      jobProfileId: formData.jobProfileId || undefined,
      endDate: formData.endDate || undefined,
      department: formData.department || undefined,
      workSchedule: formData.workSchedule || undefined,
      additionalClauses: formData.additionalClauses || undefined,
    };

    if (editingContract) {
      updateContractMutation.mutate({ id: editingContract.id, data: dataToSubmit });
    } else {
      createContractMutation.mutate(dataToSubmit);
    }
  };

  const handleBulkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (bulkWorkerIds.size === 0) {
      toast({
        title: "Error",
        description: "Debe seleccionar al menos un trabajador",
        variant: "destructive",
      });
      return;
    }

    const validationError = validateContractDates(bulkFormData.contractType, bulkFormData.startDate, bulkFormData.endDate);
    if (validationError) {
      toast({
        title: "Error de validación",
        description: validationError,
        variant: "destructive",
      });
      return;
    }

    const bulkSalaryValue = bulkFormData.salary === '' ? 0 : Number(bulkFormData.salary);
    batchCreateMutation.mutate({
      workerIds: Array.from(bulkWorkerIds),
      contractData: {
        ...bulkFormData,
        salary: bulkSalaryValue,
        jobProfileId: bulkFormData.jobProfileId || undefined,
        endDate: bulkFormData.endDate || undefined,
        department: bulkFormData.department || undefined,
        workSchedule: bulkFormData.workSchedule || undefined,
      },
    });
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const toggleSelectContract = (id: string) => {
    setSelectedContracts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedContracts.size === paginatedContracts.length) {
      setSelectedContracts(new Set());
    } else {
      setSelectedContracts(new Set(paginatedContracts.map(c => c.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedContracts.size === 0) return;
    
    if (!confirm(`¿Está seguro de eliminar ${selectedContracts.size} contrato(s)?`)) return;

    for (const id of selectedContracts) {
      await deleteContractMutation.mutateAsync(id);
    }
  };

  const toggleBulkWorker = (workerId: string) => {
    setBulkWorkerIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(workerId)) {
        newSet.delete(workerId);
      } else {
        newSet.add(workerId);
      }
      return newSet;
    });
  };

  const toggleSelectAllBulkWorkers = () => {
    if (bulkWorkerIds.size === filteredWorkersForBulk.length) {
      setBulkWorkerIds(new Set());
    } else {
      setBulkWorkerIds(new Set(filteredWorkersForBulk.map(w => w.id)));
    }
  };

  const clearFilters = () => {
    setFilterContractType("all");
    setFilterStatus("all");
    setFilterDepartment("all");
    setFilterStartDateFrom("");
    setFilterStartDateTo("");
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? 
      <ChevronUp className="h-4 w-4 inline ml-1" /> : 
      <ChevronDown className="h-4 w-4 inline ml-1" />;
  };

  const formatCurrency = (value: number | null | undefined) => {
    if (!value) return "-";
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(value);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Cargando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <BackToCronogramaButton />
      </div>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Contratos Laborales</h1>
          <p className="text-muted-foreground">Gestión de contratos según legislación colombiana 2025</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button 
            variant="outline" 
            onClick={() => setBulkDialogOpen(true)}
            data-testid="button-bulk-create"
          >
            <Users className="h-4 w-4 mr-2" />
            Crear Masivo
          </Button>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) {
              setEditingContract(null);
              resetForm();
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="workerId">Trabajador *</Label>
                    <Select
                      value={formData.workerId}
                      onValueChange={(value) => setFormData({ ...formData, workerId: value })}
                    >
                      <SelectTrigger id="workerId" data-testid="select-worker">
                        <SelectValue placeholder="Seleccionar trabajador" />
                      </SelectTrigger>
                      <SelectContent>
                        {workers.map((worker) => (
                          <SelectItem key={worker.id} value={worker.id}>
                            {worker.name} - {worker.identificationNumber}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="identificationNumber">Documento de Identidad</Label>
                    <Input
                      id="identificationNumber"
                      value={formData.identificationNumber}
                      onChange={(e) => setFormData({ ...formData, identificationNumber: e.target.value })}
                      placeholder="Ej: 1234567890"
                      data-testid="input-identification-number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="jobProfileId">Perfil de Cargo (Auto-llena campos)</Label>
                    <Select
                      value={formData.jobProfileId}
                      onValueChange={handleJobProfileChange}
                    >
                      <SelectTrigger id="jobProfileId" data-testid="select-job-profile">
                        <SelectValue placeholder="Seleccionar perfil" />
                      </SelectTrigger>
                      <SelectContent>
                        {jobProfiles.map((profile) => (
                          <SelectItem key={profile.id} value={profile.id}>
                            {profile.name} - Clase {profile.riskClass}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contractType">Tipo de Contrato *</Label>
                    <Select
                      value={formData.contractType}
                      onValueChange={(value: ContractType) => setFormData({ ...formData, contractType: value })}
                    >
                      <SelectTrigger id="contractType" data-testid="select-contract-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="indefinido">Término Indefinido</SelectItem>
                        <SelectItem value="fijo">Término Fijo (Máx 4 años)</SelectItem>
                        <SelectItem value="obra_labor">Obra o Labor</SelectItem>
                        <SelectItem value="ocasional">Ocasional (Máx 30 días)</SelectItem>
                        <SelectItem value="aprendizaje">Aprendizaje</SelectItem>
                        <SelectItem value="servicios">Prestación de Servicios</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Fecha de Inicio *</Label>
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
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="salary">Salario Mensual (COP)</Label>
                    <Input
                      id="salary"
                      type="number"
                      value={formData.salary}
                      onChange={(e) => setFormData({ ...formData, salary: e.target.value === '' ? '' : e.target.value })}
                      min={0}
                      data-testid="input-salary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="arlRate">Tasa ARL (%)</Label>
                    <Input
                      id="arlRate"
                      value={formData.arlRate}
                      onChange={(e) => setFormData({ ...formData, arlRate: e.target.value })}
                      placeholder="Se calcula al seleccionar perfil"
                      data-testid="input-arl-rate"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="position">Cargo *</Label>
                    <Input
                      id="position"
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                      placeholder="Ej: Operario de Producción"
                      required
                      data-testid="input-position"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Departamento</Label>
                    <Input
                      id="department"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      placeholder="Ej: Producción"
                      data-testid="input-department"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="workSchedule">Horario de Trabajo</Label>
                    <Input
                      id="workSchedule"
                      value={formData.workSchedule}
                      onChange={(e) => setFormData({ ...formData, workSchedule: e.target.value })}
                      placeholder="Ej: Lunes a Viernes 7:00am - 5:00pm"
                      data-testid="input-work-schedule"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
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
                  {editingContract && (
                    <div className="space-y-2">
                      <Label htmlFor="status">Estado del Contrato</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value: ContractStatus) => setFormData({ ...formData, status: value })}
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
                  )}
                </div>

                <DialogFooter>
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
                  <Button 
                    type="submit" 
                    disabled={createContractMutation.isPending || updateContractMutation.isPending}
                    data-testid="button-save"
                  >
                    {editingContract ? "Actualizar" : "Crear"} Contrato
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por contrato, trabajador o cargo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search"
              />
            </div>
            <Button
              variant={showFilters ? "secondary" : "outline"}
              onClick={() => setShowFilters(!showFilters)}
              data-testid="button-toggle-filters"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
            {(filterContractType !== "all" || filterStatus !== "all" || filterDepartment !== "all" || filterStartDateFrom || filterStartDateTo) && (
              <Button variant="ghost" size="sm" onClick={clearFilters} data-testid="button-clear-filters">
                <X className="h-4 w-4 mr-1" />
                Limpiar filtros
              </Button>
            )}
          </div>

          {/* Advanced Filters Panel */}
          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-4 pt-4 border-t">
              <div className="space-y-2">
                <Label>Tipo de Contrato</Label>
                <Select value={filterContractType} onValueChange={setFilterContractType}>
                  <SelectTrigger data-testid="filter-contract-type">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="indefinido">Indefinido</SelectItem>
                    <SelectItem value="fijo">Término Fijo</SelectItem>
                    <SelectItem value="obra_labor">Obra o Labor</SelectItem>
                    <SelectItem value="ocasional">Ocasional</SelectItem>
                    <SelectItem value="aprendizaje">Aprendizaje</SelectItem>
                    <SelectItem value="servicios">Servicios</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Estado</Label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger data-testid="filter-status">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="activo">Activo</SelectItem>
                    <SelectItem value="vencido">Vencido</SelectItem>
                    <SelectItem value="terminado">Terminado</SelectItem>
                    <SelectItem value="suspendido">Suspendido</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Departamento</Label>
                <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                  <SelectTrigger data-testid="filter-department">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {departments.map(dept => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Fecha Inicio Desde</Label>
                <Input
                  type="date"
                  value={filterStartDateFrom}
                  onChange={(e) => setFilterStartDateFrom(e.target.value)}
                  data-testid="filter-date-from"
                />
              </div>
              <div className="space-y-2">
                <Label>Fecha Inicio Hasta</Label>
                <Input
                  type="date"
                  value={filterStartDateTo}
                  onChange={(e) => setFilterStartDateTo(e.target.value)}
                  data-testid="filter-date-to"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Selection Actions */}
      {selectedContracts.size > 0 && (
        <Card className="border-primary">
          <CardContent className="py-3">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <span className="font-medium" data-testid="text-selected-count">
                {selectedContracts.size} contrato(s) seleccionado(s)
              </span>
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBulkDelete}
                  disabled={deleteContractMutation.isPending}
                  data-testid="button-bulk-delete"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar Seleccionados
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedContracts(new Set())}
                  data-testid="button-deselect-all"
                >
                  Deseleccionar Todo
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contracts Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="text-lg">
              Lista de Contratos ({sortedContracts.length})
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {sortedContracts.length === 0 ? (
            <div className="text-center text-muted-foreground py-12" data-testid="empty-state">
              No hay contratos que coincidan con los filtros
            </div>
          ) : (
            <>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedContracts.size === paginatedContracts.length && paginatedContracts.length > 0}
                          onCheckedChange={toggleSelectAll}
                          data-testid="checkbox-select-all"
                        />
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleSort("contractNumber")}
                        data-testid="th-contract-number"
                      >
                        N° Contrato <SortIcon field="contractNumber" />
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleSort("workerName")}
                        data-testid="th-worker"
                      >
                        Trabajador <SortIcon field="workerName" />
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleSort("position")}
                        data-testid="th-position"
                      >
                        Cargo <SortIcon field="position" />
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleSort("contractType")}
                        data-testid="th-contract-type"
                      >
                        Tipo <SortIcon field="contractType" />
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleSort("startDate")}
                        data-testid="th-start-date"
                      >
                        Fecha Inicio <SortIcon field="startDate" />
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleSort("endDate")}
                        data-testid="th-end-date"
                      >
                        Fecha Fin <SortIcon field="endDate" />
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-muted/50 text-right"
                        onClick={() => handleSort("salary")}
                        data-testid="th-salary"
                      >
                        Salario <SortIcon field="salary" />
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleSort("status")}
                        data-testid="th-status"
                      >
                        Estado <SortIcon field="status" />
                      </TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedContracts.map((contract) => (
                      <TableRow key={contract.id} data-testid={`row-contract-${contract.id}`}>
                        <TableCell>
                          <Checkbox
                            checked={selectedContracts.has(contract.id)}
                            onCheckedChange={() => toggleSelectContract(contract.id)}
                            data-testid={`checkbox-contract-${contract.id}`}
                          />
                        </TableCell>
                        <TableCell className="font-medium" data-testid={`cell-number-${contract.id}`}>
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            {contract.contractNumber}
                          </div>
                        </TableCell>
                        <TableCell data-testid={`cell-worker-${contract.id}`}>
                          {contract.workerName}
                        </TableCell>
                        <TableCell data-testid={`cell-position-${contract.id}`}>
                          {contract.position}
                        </TableCell>
                        <TableCell data-testid={`cell-type-${contract.id}`}>
                          <Badge variant="outline">
                            {contractTypeLabels[contract.contractType] || contract.contractType}
                          </Badge>
                        </TableCell>
                        <TableCell data-testid={`cell-start-${contract.id}`}>
                          {format(new Date(contract.startDate), "dd/MM/yyyy")}
                        </TableCell>
                        <TableCell data-testid={`cell-end-${contract.id}`}>
                          {contract.endDate ? format(new Date(contract.endDate), "dd/MM/yyyy") : "-"}
                        </TableCell>
                        <TableCell className="text-right font-mono" data-testid={`cell-salary-${contract.id}`}>
                          {formatCurrency(contract.salary)}
                        </TableCell>
                        <TableCell data-testid={`cell-status-${contract.id}`}>
                          <Badge className={statusColors[contract.status as ContractStatus]}>
                            {contract.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(contract)}
                              data-testid={`button-edit-${contract.id}`}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                if (confirm("¿Está seguro de eliminar este contrato?")) {
                                  deleteContractMutation.mutate(contract.id);
                                }
                              }}
                              data-testid={`button-delete-${contract.id}`}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground" data-testid="text-pagination-info">
                    Mostrando {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, sortedContracts.length)} de {sortedContracts.length}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      data-testid="button-prev-page"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm" data-testid="text-current-page">
                      Página {currentPage} de {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      data-testid="button-next-page"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Bulk Creation Dialog */}
      <Dialog open={bulkDialogOpen} onOpenChange={(open) => {
        setBulkDialogOpen(open);
        if (!open) {
          setBulkWorkerIds(new Set());
          resetBulkForm();
        }
      }}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Crear Contratos Masivos</DialogTitle>
            <DialogDescription>
              Seleccione trabajadores sin contrato activo y configure los datos comunes del contrato
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleBulkSubmit} className="flex-1 overflow-hidden flex flex-col gap-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 overflow-hidden">
              {/* Workers Selection Panel */}
              <div className="border rounded-lg p-4 flex flex-col overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                  <h3 className="font-semibold">Trabajadores sin contrato activo</h3>
                  <Badge variant="secondary" data-testid="badge-workers-selected">
                    {bulkWorkerIds.size} seleccionado(s)
                  </Badge>
                </div>
                
                <div className="flex gap-2 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar trabajador..."
                      value={bulkWorkerSearch}
                      onChange={(e) => setBulkWorkerSearch(e.target.value)}
                      className="pl-10"
                      data-testid="input-bulk-worker-search"
                    />
                  </div>
                  <Select value={bulkDepartmentFilter} onValueChange={setBulkDepartmentFilter}>
                    <SelectTrigger className="w-[150px]" data-testid="select-bulk-department-filter">
                      <SelectValue placeholder="Departamento" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      {departments.map(dept => (
                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={toggleSelectAllBulkWorkers}
                    data-testid="button-bulk-select-all-workers"
                  >
                    {bulkWorkerIds.size === filteredWorkersForBulk.length ? "Deseleccionar Todos" : "Seleccionar Todos"}
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    ({filteredWorkersForBulk.length} disponibles)
                  </span>
                </div>

                <ScrollArea className="flex-1 border rounded-md">
                  <div className="p-2 space-y-1">
                    {filteredWorkersForBulk.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No hay trabajadores sin contrato activo
                      </p>
                    ) : (
                      filteredWorkersForBulk.map(worker => (
                        <div
                          key={worker.id}
                          className="flex items-center gap-3 p-2 rounded-md hover:bg-muted cursor-pointer"
                          onClick={() => toggleBulkWorker(worker.id)}
                          data-testid={`bulk-worker-${worker.id}`}
                        >
                          <Checkbox
                            checked={bulkWorkerIds.has(worker.id)}
                            onCheckedChange={() => toggleBulkWorker(worker.id)}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{worker.name}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {worker.identificationNumber} - {worker.department}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </div>

              {/* Contract Data Panel */}
              <div className="border rounded-lg p-4 overflow-y-auto">
                <h3 className="font-semibold mb-4">Datos del Contrato</h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="bulkJobProfile">Perfil de Cargo (Auto-llena campos)</Label>
                    <Select
                      value={bulkFormData.jobProfileId}
                      onValueChange={handleBulkJobProfileChange}
                    >
                      <SelectTrigger data-testid="bulk-select-job-profile">
                        <SelectValue placeholder="Seleccionar perfil" />
                      </SelectTrigger>
                      <SelectContent>
                        {jobProfiles.map((profile) => (
                          <SelectItem key={profile.id} value={profile.id}>
                            {profile.name} - Clase {profile.riskClass}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bulkContractType">Tipo de Contrato *</Label>
                    <Select
                      value={bulkFormData.contractType}
                      onValueChange={(value: ContractType) => setBulkFormData({ ...bulkFormData, contractType: value })}
                    >
                      <SelectTrigger data-testid="bulk-select-contract-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="indefinido">Término Indefinido</SelectItem>
                        <SelectItem value="fijo">Término Fijo (Máx 4 años)</SelectItem>
                        <SelectItem value="obra_labor">Obra o Labor</SelectItem>
                        <SelectItem value="ocasional">Ocasional (Máx 30 días)</SelectItem>
                        <SelectItem value="aprendizaje">Aprendizaje</SelectItem>
                        <SelectItem value="servicios">Prestación de Servicios</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="bulkStartDate">Fecha de Inicio *</Label>
                      <Input
                        id="bulkStartDate"
                        type="date"
                        value={bulkFormData.startDate}
                        onChange={(e) => setBulkFormData({ ...bulkFormData, startDate: e.target.value })}
                        required
                        data-testid="bulk-input-start-date"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bulkEndDate">
                        Fecha de Fin {bulkFormData.contractType === "fijo" && "*"}
                      </Label>
                      <Input
                        id="bulkEndDate"
                        type="date"
                        value={bulkFormData.endDate}
                        onChange={(e) => setBulkFormData({ ...bulkFormData, endDate: e.target.value })}
                        required={bulkFormData.contractType === "fijo"}
                        disabled={bulkFormData.contractType === "indefinido"}
                        data-testid="bulk-input-end-date"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bulkSalary">Salario Mensual (COP)</Label>
                    <Input
                      id="bulkSalary"
                      type="number"
                      value={bulkFormData.salary}
                      onChange={(e) => setBulkFormData({ ...bulkFormData, salary: e.target.value === '' ? '' : e.target.value })}
                      min={0}
                      data-testid="bulk-input-salary"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bulkPosition">Cargo *</Label>
                    <Input
                      id="bulkPosition"
                      value={bulkFormData.position}
                      onChange={(e) => setBulkFormData({ ...bulkFormData, position: e.target.value })}
                      placeholder="Ej: Operario de Producción"
                      required
                      data-testid="bulk-input-position"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bulkDepartment">Departamento</Label>
                    <Input
                      id="bulkDepartment"
                      value={bulkFormData.department}
                      onChange={(e) => setBulkFormData({ ...bulkFormData, department: e.target.value })}
                      placeholder="Ej: Producción"
                      data-testid="bulk-input-department"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bulkWorkSchedule">Horario de Trabajo</Label>
                    <Input
                      id="bulkWorkSchedule"
                      value={bulkFormData.workSchedule}
                      onChange={(e) => setBulkFormData({ ...bulkFormData, workSchedule: e.target.value })}
                      placeholder="Ej: Lunes a Viernes 7:00am - 5:00pm"
                      data-testid="bulk-input-work-schedule"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bulkArlRate">Tasa ARL (%)</Label>
                    <Input
                      id="bulkArlRate"
                      value={bulkFormData.arlRate}
                      onChange={(e) => setBulkFormData({ ...bulkFormData, arlRate: e.target.value })}
                      placeholder="Se calcula al seleccionar perfil"
                      data-testid="bulk-input-arl-rate"
                      readOnly
                    />
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setBulkDialogOpen(false);
                  setBulkWorkerIds(new Set());
                  resetBulkForm();
                }}
                data-testid="bulk-button-cancel"
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                disabled={bulkWorkerIds.size === 0 || batchCreateMutation.isPending}
                data-testid="bulk-button-create"
              >
                {batchCreateMutation.isPending ? "Creando..." : `Crear ${bulkWorkerIds.size} Contrato(s)`}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
