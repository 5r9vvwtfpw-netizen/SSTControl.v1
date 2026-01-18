import { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { JobProfile, Company, Worker } from "@shared/schema";
import { insertJobProfileSchema } from "@shared/schema";
import { getArlRate, examFrequencyByRisk } from "@shared/arl-rates";
import { PREDEFINED_PROFILES } from "@/data/perfiles-cargo-predefinidos";
import { ArrayInput } from "@/components/shared/ArrayInput";
import { hasCompanyAdminAccess, hasGlobalAccess } from "@shared/permissions";
import type { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Briefcase, Shield, Clock, AlertCircle, Users, Layers, Download, Wand2, Trash2, AlertTriangle, RefreshCw, CalendarDays } from "lucide-react";
import { BackToEvaluationButton } from "@/components/BackToEvaluationButton";

export default function PerfilesCargo() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<JobProfile | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // For admin: company selection filter
  const isAdmin = user?.role ? hasCompanyAdminAccess(user.role) : false;
  // hasGlobalAccess = true only for superadmin/soporte (can see all companies)
  const hasGlobalCompanyAccess = user?.role ? hasGlobalAccess(user.role) : false;
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("all");
  
  // Effective company ID for filtering: global admins use selectedCompanyId, others use their own companyId
  const effectiveCompanyId = hasGlobalCompanyAccess ? selectedCompanyId : (user?.companyId || "");

  const [formData, setFormData] = useState({
    companyId: "",
    name: "",
    description: "",
    riskClass: "I" as "I" | "II" | "III" | "IV" | "V",
    riskFactors: [] as string[],
    physicalDemands: "",
    mentalDemands: "",
    requiredPpe: [] as string[],
    requiredExams: [] as string[],
    examFrequencyMonths: 24 as number | string,
    requiredTrainings: [] as string[],
    isActive: 1,
  });

  const { data: profiles = [], isLoading } = useQuery<JobProfile[]>({
    queryKey: ["/api/job-profiles"],
  });

  const { data: companies = [] } = useQuery<Company[]>({
    queryKey: ["/api/companies"],
  });

  const { data: workers = [] } = useQuery<Worker[]>({
    queryKey: ["/api/workers"],
  });

  // State for selected workers to assign to the profile
  const [selectedWorkerIds, setSelectedWorkerIds] = useState<string[]>([]);
  
  // Ref to store workers to assign after profile creation (for reliable async handling)
  const pendingWorkersToAssignRef = useRef<string[]>([]);

  // State for bulk profile creation
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [selectedPositions, setSelectedPositions] = useState<string[]>([]);
  const [bulkDefaultRiskClass, setBulkDefaultRiskClass] = useState<"I" | "II" | "III" | "IV" | "V">("I");
  const [bulkCompanyId, setBulkCompanyId] = useState<string>("");

  // State for bulk delete
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [bulkDeleteConfirmCode, setBulkDeleteConfirmCode] = useState("");
  const [bulkDeleteCompanyName, setBulkDeleteCompanyName] = useState("");
  const [bulkDeleteResults, setBulkDeleteResults] = useState<{ message: string; deleted: number; total: number; errors?: string[] } | null>(null);

  // State for form validation - show error only on submit
  const [showNameError, setShowNameError] = useState(false);

  // State for delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [profileToDelete, setProfileToDelete] = useState<JobProfile | null>(null);
  const [profileReferences, setProfileReferences] = useState<{
    references: { workers: number; medicalExams: number; altoRiesgo: number; contracts: number; designaciones: number };
    canForceDeleteWorkers: boolean;
  } | null>(null);
  const [isLoadingReferences, setIsLoadingReferences] = useState(false);

  const createProfileMutation = useMutation({
    mutationFn: async (data: z.infer<typeof insertJobProfileSchema> & { companyId?: string }) => {
      const res = await apiRequest("POST", "/api/job-profiles", data);
      const profile = await res.json();
      console.log('[DEBUG] createProfileMutation - Profile created:', profile);
      return profile;
    },
    onSuccess: async (newProfile) => {
      console.log('[DEBUG] createProfileMutation onSuccess - newProfile:', newProfile);
      console.log('[DEBUG] createProfileMutation onSuccess - pendingWorkersToAssignRef:', pendingWorkersToAssignRef.current);
      
      // Check if there are workers to assign from the ref
      const workersToAssign = pendingWorkersToAssignRef.current;
      if (workersToAssign.length > 0 && newProfile?.id) {
        console.log('[DEBUG] createProfileMutation - Assigning workers to new profile:', newProfile.id);
        try {
          // Call the assign-workers endpoint directly
          const res = await apiRequest("POST", `/api/job-profiles/${newProfile.id}/assign-workers`, { workerIds: workersToAssign });
          const result = await res.json();
          console.log('[DEBUG] createProfileMutation - Workers assigned result:', result);
          
          // Invalidate workers cache to show updated jobProfileId
          queryClient.invalidateQueries({ queryKey: ["/api/workers"] });
          
          toast({
            title: "Perfil creado y trabajadores asignados",
            description: `El perfil "${newProfile.name}" se creó y se asignó a ${result.updatedCount} trabajador(es)`,
            className: "bg-green-50 border-green-200",
          });
        } catch (err: any) {
          console.error('[DEBUG] createProfileMutation - Error assigning workers:', err);
          toast({
            title: "Perfil creado, pero error al asignar trabajadores",
            description: err.message || "Error desconocido al asignar trabajadores",
            variant: "destructive",
          });
        }
        // Clear the ref
        pendingWorkersToAssignRef.current = [];
      } else {
        toast({
          title: "Perfil creado",
          description: "El perfil de cargo se ha creado exitosamente",
          className: "bg-yellow-50 border-yellow-200",
        });
      }
      
      queryClient.invalidateQueries({ queryKey: ["/api/job-profiles"] });
      setDialogOpen(false);
      resetForm();
      setSelectedWorkerIds([]);
    },
    onError: (error: Error) => {
      // Clear the ref on error too
      pendingWorkersToAssignRef.current = [];
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<z.infer<typeof insertJobProfileSchema>> }) => {
      const res = await apiRequest("PATCH", `/api/job-profiles/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/job-profiles"] });
      setDialogOpen(false);
      setEditingProfile(null);
      resetForm();
      toast({
        title: "Perfil actualizado",
        description: "El perfil de cargo se ha actualizado exitosamente",
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

  const deleteProfileMutation = useMutation({
    mutationFn: async ({ id, forceDisassociateWorkers }: { id: string; forceDisassociateWorkers?: boolean }) => {
      const url = forceDisassociateWorkers 
        ? `/api/job-profiles/${id}?forceDisassociateWorkers=true`
        : `/api/job-profiles/${id}`;
      const res = await apiRequest("DELETE", url);
      if (res.status === 204) return null;
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/job-profiles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/workers"] });
      setDeleteDialogOpen(false);
      setProfileToDelete(null);
      setProfileReferences(null);
      if (data?.disassociatedWorkers) {
        toast({
          title: "Perfil eliminado",
          description: `Se eliminó el perfil y se desasociaron ${data.disassociatedWorkers} trabajador(es)`,
          className: "bg-yellow-50 border-yellow-200",
        });
      } else {
        toast({
          title: "Perfil eliminado",
          description: "El perfil de cargo se ha eliminado exitosamente",
          className: "bg-yellow-50 border-yellow-200",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "No se puede eliminar el perfil",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDeleteClick = async (profile: JobProfile) => {
    setProfileToDelete(profile);
    setIsLoadingReferences(true);
    setDeleteDialogOpen(true);
    
    try {
      const res = await apiRequest("GET", `/api/job-profiles/${profile.id}/references`);
      const data = await res.json();
      setProfileReferences(data);
    } catch (error) {
      console.error("Error fetching references:", error);
      setProfileReferences({
        references: { workers: 0, medicalExams: 0, altoRiesgo: 0, contracts: 0, designaciones: 0 },
        canForceDeleteWorkers: false
      });
    } finally {
      setIsLoadingReferences(false);
    }
  };

  const resetForm = () => {
    // For admin: default to selected company in filter only if it's a valid company (not "all")
    // For non-admin: use their own companyId
    // Auto-seleccionar si solo hay una empresa disponible
    let defaultCompanyId = "";
    if (isAdmin) {
      if (companies.length === 1) {
        defaultCompanyId = companies[0].id;
      } else if (selectedCompanyId !== "all") {
        defaultCompanyId = selectedCompanyId;
      }
    } else {
      defaultCompanyId = user?.companyId || "";
    }
    
    setFormData({
      companyId: defaultCompanyId,
      name: "",
      description: "",
      riskClass: "I",
      riskFactors: [],
      physicalDemands: "",
      mentalDemands: "",
      requiredPpe: [],
      requiredExams: [],
      examFrequencyMonths: 24,
      requiredTrainings: [],
      isActive: 1,
    });
  };

  const handleEdit = (profile: JobProfile) => {
    setEditingProfile(profile);
    setFormData({
      companyId: profile.companyId,
      name: profile.name,
      description: profile.description,
      riskClass: profile.riskClass,
      riskFactors: profile.riskFactors || [],
      physicalDemands: profile.physicalDemands || "",
      mentalDemands: profile.mentalDemands || "",
      requiredPpe: profile.requiredPpe || [],
      requiredExams: profile.requiredExams || [],
      examFrequencyMonths: profile.examFrequencyMonths || 24,
      requiredTrainings: profile.requiredTrainings || [],
      isActive: profile.isActive,
    });
    
    // Cargar los trabajadores que ya tienen este perfil asignado
    // Filter by jobProfileId (preferred) OR position matching profile name (fallback for legacy data)
    const assignedWorkers = workers.filter(
      w => w.companyId === profile.companyId && 
           (w.jobProfileId === profile.id || w.position === profile.name)
    );
    setSelectedWorkerIds(assignedWorkers.map(w => w.id));
    
    setDialogOpen(true);
  };

  // Batch mutation to assign profile to multiple workers at once
  const assignWorkersMutation = useMutation({
    mutationFn: async ({ profileId, workerIds }: { profileId: string; workerIds: string[] }) => {
      console.log('[DEBUG] assignWorkersMutation - profileId:', profileId, 'workerIds:', workerIds);
      const res = await apiRequest("POST", `/api/job-profiles/${profileId}/assign-workers`, { workerIds });
      const result = await res.json();
      console.log('[DEBUG] assignWorkersMutation - response:', result);
      return result;
    },
    onSuccess: (data) => {
      console.log('[DEBUG] assignWorkersMutation onSuccess - data:', data);
      queryClient.invalidateQueries({ queryKey: ["/api/workers"] });
      toast({
        title: "Trabajadores actualizados",
        description: `Se asignó el cargo "${data.profileName}" a ${data.updatedCount} trabajador(es)`,
        className: "bg-green-50 border-green-200",
      });
      setSelectedWorkerIds([]);
    },
    onError: (error: Error) => {
      console.error('[DEBUG] assignWorkersMutation onError:', error);
      toast({
        title: "Error al asignar trabajadores",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Batch creation mutation for bulk profile creation
  const batchCreateProfilesMutation = useMutation({
    mutationFn: async (data: { profiles: z.infer<typeof insertJobProfileSchema>[]; companyId: string }) => {
      const res = await apiRequest("POST", "/api/job-profiles/batch", data);
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/job-profiles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/workers"] });
      setBulkDialogOpen(false);
      setSelectedPositions([]);
      setBulkDefaultRiskClass("I");
      
      const parts = [];
      if (data.createdCount > 0) {
        parts.push(`${data.createdCount} perfil(es) creado(s)`);
      }
      if (data.reusedCount > 0) {
        parts.push(`${data.reusedCount} ya existente(s)`);
      }
      if (data.workersAssigned > 0) {
        parts.push(`${data.workersAssigned} trabajador(es) vinculado(s)`);
      }
      if (data.workersSkipped > 0) {
        parts.push(`${data.workersSkipped} trabajador(es) ya tenían perfil asignado`);
      }
      
      toast({
        title: "Creación masiva completada",
        description: parts.join(". ") || "Operación completada sin cambios",
        className: "bg-green-50 border-green-200",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error al crear perfiles",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Bulk delete mutation for all profiles of a company
  const bulkDeleteProfilesMutation = useMutation({
    mutationFn: async (data: { companyId: string; confirmationCode: string; confirmCompanyName: string }) => {
      const res = await apiRequest("DELETE", `/api/job-profiles/bulk-delete/${data.companyId}`, {
        confirmationCode: data.confirmationCode,
        confirmCompanyName: data.confirmCompanyName,
      });
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/job-profiles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/workers"] });
      setBulkDeleteResults(data);
      toast({
        title: "Perfiles eliminados",
        description: data.message,
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

  // Sync workers to profiles mutation
  const syncWorkersMutation = useMutation({
    mutationFn: async (companyId: string) => {
      const res = await apiRequest("POST", "/api/job-profiles/sync-workers", { companyId });
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/workers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/job-profiles"] });
      toast({
        title: "Sincronización completada",
        description: `${data.totalAssigned} trabajador(es) vinculado(s) a sus perfiles. ${data.alreadyLinked} ya estaban vinculados. ${data.noMatchingProfile} sin perfil coincidente.`,
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

  // Calculate unique positions from workers that don't have existing profiles
  const getUniquePositionsWithoutProfiles = (companyIdFilter?: string) => {
    const existingProfileNames = new Set(profiles.map(p => p.name.toLowerCase()));
    const filteredWorkers = companyIdFilter 
      ? workers.filter(w => w.companyId === companyIdFilter)
      : isAdmin ? [] : workers;
    
    const uniquePositions = new Set<string>();
    filteredWorkers.forEach(worker => {
      if (worker.position && !existingProfileNames.has(worker.position.toLowerCase())) {
        uniquePositions.add(worker.position);
      }
    });
    return Array.from(uniquePositions).sort();
  };

  // Handle bulk profile creation
  const handleBulkCreate = () => {
    const companyId = hasGlobalCompanyAccess ? bulkCompanyId : (user?.companyId || "");
    
    if (!companyId) {
      toast({
        title: "Error",
        description: "Debe seleccionar una empresa",
        variant: "destructive",
      });
      return;
    }
    
    if (selectedPositions.length === 0) {
      toast({
        title: "Error",
        description: "Debe seleccionar al menos un cargo",
        variant: "destructive",
      });
      return;
    }
    
    // Create profiles array from selected positions
    const profilesToCreate = selectedPositions.map(positionName => {
      // Check if position matches a predefined profile
      const predefinedProfile = PREDEFINED_PROFILES[positionName];
      
      if (predefinedProfile) {
        return {
          name: predefinedProfile.name,
          description: predefinedProfile.description,
          riskClass: predefinedProfile.riskClass,
          riskFactors: predefinedProfile.riskFactors,
          physicalDemands: predefinedProfile.physicalDemands,
          mentalDemands: predefinedProfile.mentalDemands,
          requiredPpe: predefinedProfile.requiredPpe,
          requiredExams: predefinedProfile.requiredExams,
          examFrequencyMonths: examFrequencyByRisk[predefinedProfile.riskClass],
          requiredTrainings: predefinedProfile.requiredTrainings,
          isActive: 1,
        };
      }
      
      // Use defaults with user-selected risk class
      return {
        name: positionName,
        description: `Perfil de cargo para ${positionName}`,
        riskClass: bulkDefaultRiskClass,
        riskFactors: [],
        physicalDemands: "",
        mentalDemands: "",
        requiredPpe: [],
        requiredExams: ["Examen médico ocupacional general"],
        examFrequencyMonths: examFrequencyByRisk[bulkDefaultRiskClass],
        requiredTrainings: [],
        isActive: 1,
      };
    });
    
    batchCreateProfilesMutation.mutate({ profiles: profilesToCreate, companyId });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate name is not empty (only for new profiles, not editing)
    if (!editingProfile && !formData.name.trim()) {
      setShowNameError(true);
      toast({
        title: "Error",
        description: "El nombre del cargo es obligatorio",
        variant: "destructive",
      });
      return;
    }
    setShowNameError(false);
    
    // Validate companyId for users with global access
    if (hasGlobalCompanyAccess && !formData.companyId) {
      toast({
        title: "Error",
        description: "Debe seleccionar una empresa",
        variant: "destructive",
      });
      return;
    }
    
    // Store the worker IDs to assign after profile creation
    const workersToAssign = [...selectedWorkerIds];
    
    const examFrequencyValue = formData.examFrequencyMonths === '' ? 24 : Number(formData.examFrequencyMonths);
    const submissionData = { ...formData, examFrequencyMonths: examFrequencyValue };
    
    if (editingProfile) {
      // For editing, update profile and assign workers if needed
      updateProfileMutation.mutate({ id: editingProfile.id, data: submissionData });
      
      // If workers selected, use batch endpoint
      if (workersToAssign.length > 0) {
        assignWorkersMutation.mutate({ 
          profileId: editingProfile.id, 
          workerIds: workersToAssign 
        });
      }
    } else {
      // For new profiles, store workers in ref and create profile
      // The onSuccess callback in createProfileMutation will handle worker assignment
      console.log('[DEBUG] handleSubmit - Creating new profile with workers:', workersToAssign);
      pendingWorkersToAssignRef.current = workersToAssign;
      createProfileMutation.mutate(submissionData);
    }
  };

  const filteredProfiles = profiles.filter(profile => {
    // Filter by company: admins can see all or filter by company, non-admins see only their company
    if (effectiveCompanyId && effectiveCompanyId !== "all" && profile.companyId !== effectiveCompanyId) {
      return false;
    }
    
    // Filter by search term
    return profile.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.description.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getRiskColor = (riskClass: string) => {
    const colors = {
      "I": "bg-green-500",
      "II": "bg-blue-500",
      "III": "bg-yellow-500",
      "IV": "bg-orange-500",
      "V": "bg-red-500"
    };
    return colors[riskClass as keyof typeof colors] || "bg-gray-500";
  };

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

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Cargando...</div>;
  }

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
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Perfiles de Cargo</h1>
          <p className="text-muted-foreground">Gestión de perfiles de cargo con clasificación de riesgo ARL</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) {
              setEditingProfile(null);
              resetForm();
              setSelectedWorkerIds([]);
              setShowNameError(false);
            }
          }}>
            <DialogTrigger asChild>
              <Button 
                data-testid="button-add-profile"
                onClick={() => {
                  setEditingProfile(null);
                  resetForm();
                  setSelectedWorkerIds([]);
                  setShowNameError(false);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Perfil
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProfile ? "Editar Perfil" : "Nuevo Perfil de Cargo"}</DialogTitle>
              <DialogDescription>
                Complete la información del perfil según Resolución 1843/2025
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                {hasGlobalCompanyAccess && (
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="company">Empresa *</Label>
                    <Select
                      value={formData.companyId}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, companyId: value }))}
                      required
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
                
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="name">Nombre del Cargo *</Label>
                  <Select
                    value={formData.name in PREDEFINED_PROFILES ? formData.name : "__custom__"}
                    onValueChange={(value) => {
                      if (value === "__custom__") {
                        // No hacer nada, el usuario ingresará el nombre manualmente
                        setFormData(prev => ({ ...prev, name: "" }));
                      } else {
                        // Auto-llenar todos los campos según el cargo seleccionado
                        // Esto funciona tanto para creación como para edición
                        const profile = PREDEFINED_PROFILES[value];
                        if (profile) {
                          setFormData(prev => ({
                            ...prev,
                            name: profile.name,
                            description: profile.description,
                            riskClass: profile.riskClass,
                            riskFactors: profile.riskFactors,
                            physicalDemands: profile.physicalDemands,
                            mentalDemands: profile.mentalDemands,
                            requiredPpe: profile.requiredPpe,
                            requiredExams: profile.requiredExams,
                            examFrequencyMonths: examFrequencyByRisk[profile.riskClass],
                            requiredTrainings: profile.requiredTrainings,
                          }));
                        } else {
                          setFormData(prev => ({ ...prev, name: value }));
                        }
                      }
                    }}
                  >
                    <SelectTrigger id="name-select" data-testid="select-profile-name">
                      <SelectValue placeholder="Seleccione un cargo predefinido o personalizado" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      <SelectItem value="__custom__">
                        ✏️ Cargo Personalizado (ingrese manualmente)
                      </SelectItem>
                      {Object.keys(PREDEFINED_PROFILES).sort().map((profileName) => (
                        <SelectItem key={profileName} value={profileName}>
                          {profileName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {(formData.name === "" || !(formData.name in PREDEFINED_PROFILES)) && (
                    <div className="mt-2">
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => {
                          setFormData(prev => ({ ...prev, name: e.target.value }));
                          if (e.target.value.trim()) setShowNameError(false);
                        }}
                        placeholder="Ingrese el nombre del cargo personalizado"
                        required
                        data-testid="input-custom-profile-name"
                        className={showNameError && !formData.name.trim() ? "border-red-500" : ""}
                      />
                      {showNameError && !formData.name.trim() && (
                        <p className="text-xs text-red-600 mt-1">
                          * Nombre del cargo es obligatorio. Escriba el nombre antes de guardar.
                        </p>
                      )}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Seleccione un cargo predefinido para auto-llenar todos los campos, o cree uno personalizado ingresando el nombre manualmente.
                  </p>
                </div>

                {/* Selector de Trabajadores - Inteligente para empresas con muchos empleados */}
                <div className="space-y-2 col-span-2">
                  <Label className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Asignar Trabajadores a este Perfil
                    <span className="text-xs font-normal text-muted-foreground">(Opcional)</span>
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Puede asignar trabajadores ahora o hacerlo más tarde. Esta sección es opcional.
                  </p>
                  <div className="border rounded-md p-3">
                    {(() => {
                      // Filtrar trabajadores por empresa seleccionada
                      const filteredWorkers = formData.companyId 
                        ? workers.filter(w => w.companyId === formData.companyId)
                        : hasGlobalCompanyAccess ? [] : workers;
                      
                      if (hasGlobalCompanyAccess && !formData.companyId) {
                        return (
                          <p className="text-sm text-muted-foreground text-center py-2">
                            Seleccione primero una empresa para ver los trabajadores disponibles
                          </p>
                        );
                      }
                      
                      if (filteredWorkers.length === 0) {
                        return (
                          <p className="text-sm text-muted-foreground text-center py-2">
                            No hay trabajadores registrados en esta empresa
                          </p>
                        );
                      }
                      
                      const allSelected = filteredWorkers.length > 0 && 
                        filteredWorkers.every(w => selectedWorkerIds.includes(w.id));

                      // Agrupar trabajadores por departamento
                      const departmentGroups = filteredWorkers.reduce((acc, worker) => {
                        const dept = worker.department || "Sin departamento";
                        if (!acc[dept]) acc[dept] = [];
                        acc[dept].push(worker);
                        return acc;
                      }, {} as Record<string, typeof filteredWorkers>);

                      // Agrupar trabajadores por cargo actual
                      const positionGroups = filteredWorkers.reduce((acc, worker) => {
                        const pos = worker.position || "Sin cargo";
                        if (!acc[pos]) acc[pos] = [];
                        acc[pos].push(worker);
                        return acc;
                      }, {} as Record<string, typeof filteredWorkers>);

                      // Helper para seleccionar/deseleccionar un grupo
                      const toggleGroup = (workerIds: string[]) => {
                        const allInGroupSelected = workerIds.every(id => selectedWorkerIds.includes(id));
                        if (allInGroupSelected) {
                          setSelectedWorkerIds(prev => prev.filter(id => !workerIds.includes(id)));
                        } else {
                          setSelectedWorkerIds(prev => Array.from(new Set([...prev, ...workerIds])));
                        }
                      };

                      // Helper para seleccionar por cargo Y auto-llenar el nombre del perfil
                      const togglePositionGroup = (positionName: string, workerIds: string[]) => {
                        const allInGroupSelected = workerIds.every(id => selectedWorkerIds.includes(id));
                        if (allInGroupSelected) {
                          // Deseleccionar trabajadores
                          setSelectedWorkerIds(prev => prev.filter(id => !workerIds.includes(id)));
                        } else {
                          // Seleccionar trabajadores
                          setSelectedWorkerIds(prev => Array.from(new Set([...prev, ...workerIds])));
                          // Auto-llenar el nombre del cargo si está vacío o si es "Sin cargo"
                          if (positionName && positionName !== "Sin cargo" && !formData.name) {
                            setFormData(prev => ({ ...prev, name: positionName }));
                          }
                        }
                      };

                      // Contar seleccionados en grupo
                      const countSelectedInGroup = (workerIds: string[]) => 
                        workerIds.filter(id => selectedWorkerIds.includes(id)).length;

                      // Función para sugerir trabajadores por coincidencia de cargo
                      const suggestWorkersByPosition = () => {
                        const profileName = formData.name.toLowerCase().trim();
                        if (!profileName) {
                          toast({
                            title: "Sin nombre de perfil",
                            description: "Ingrese primero el nombre del cargo para poder sugerir trabajadores",
                            variant: "destructive",
                          });
                          return;
                        }

                        // Extraer palabras clave del nombre del perfil (ignorando palabras comunes cortas)
                        const stopWords = ["de", "del", "la", "el", "los", "las", "y", "en", "a", "o", "u"];
                        const keywords = profileName
                          .split(/\s+/)
                          .filter(word => word.length > 2 && !stopWords.includes(word));

                        if (keywords.length === 0) {
                          toast({
                            title: "Sin palabras clave",
                            description: "El nombre del perfil no contiene palabras válidas para buscar",
                            variant: "destructive",
                          });
                          return;
                        }

                        // Buscar trabajadores cuyo cargo coincida parcialmente
                        // Solo incluir trabajadores que NO estén ya asignados a este perfil
                        const matchingWorkerIds: string[] = [];
                        
                        filteredWorkers.forEach(worker => {
                          // Excluir trabajadores ya seleccionados
                          if (selectedWorkerIds.includes(worker.id)) return;
                          
                          // Excluir trabajadores ya asignados a este perfil (por jobProfileId)
                          if (editingProfile && worker.jobProfileId === editingProfile.id) return;
                          
                          const workerPosition = (worker.position || "").toLowerCase();
                          
                          // Verificar si alguna palabra clave coincide con el cargo del trabajador
                          const matches = keywords.some(keyword => workerPosition.includes(keyword));
                          
                          if (matches) {
                            matchingWorkerIds.push(worker.id);
                          }
                        });

                        if (matchingWorkerIds.length === 0) {
                          toast({
                            title: "Sin coincidencias",
                            description: `No se encontraron trabajadores con cargo similar a "${formData.name}"`,
                            className: "bg-yellow-50 border-yellow-200",
                          });
                          return;
                        }

                        // Pre-seleccionar los trabajadores encontrados
                        setSelectedWorkerIds(prev => Array.from(new Set([...prev, ...matchingWorkerIds])));
                        
                        toast({
                          title: "Trabajadores sugeridos",
                          description: `Se pre-seleccionaron ${matchingWorkerIds.length} trabajador(es) con cargo similar a "${formData.name}"`,
                          className: "bg-green-50 border-green-200",
                        });
                      };
                      
                      return (
                        <>
                          <div className="flex items-center justify-between mb-2 pb-2 border-b flex-wrap gap-2">
                            <span className="text-sm text-muted-foreground">
                              {filteredWorkers.length} trabajador(es) disponible(s)
                            </span>
                            <div className="flex gap-2 flex-wrap">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={suggestWorkersByPosition}
                                data-testid="button-suggest-workers-by-position"
                              >
                                <Wand2 className="h-4 w-4 mr-1" />
                                Sugerir por cargo
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  if (allSelected) {
                                    setSelectedWorkerIds(prev => 
                                      prev.filter(id => !filteredWorkers.some(w => w.id === id))
                                    );
                                  } else {
                                    const newIds = filteredWorkers.map(w => w.id);
                                    setSelectedWorkerIds(prev => Array.from(new Set([...prev, ...newIds])));
                                  }
                                }}
                                data-testid="button-select-all-workers"
                              >
                                {allSelected ? "Deseleccionar Todos" : "Seleccionar Todos"}
                              </Button>
                            </div>
                          </div>

                          {/* Selección rápida por Departamento */}
                          {Object.keys(departmentGroups).length > 1 && (
                            <div className="mb-3 pb-2 border-b">
                              <p className="text-xs font-medium text-muted-foreground mb-2">Selección rápida por Departamento:</p>
                              <div className="flex flex-wrap gap-1">
                                {Object.entries(departmentGroups).map(([dept, deptWorkers]) => {
                                  const workerIds = deptWorkers.map(w => w.id);
                                  const selectedCount = countSelectedInGroup(workerIds);
                                  const allDeptSelected = selectedCount === workerIds.length;
                                  return (
                                    <Button
                                      key={dept}
                                      type="button"
                                      variant={allDeptSelected ? "default" : "outline"}
                                      size="sm"
                                      className="text-xs h-7"
                                      onClick={() => toggleGroup(workerIds)}
                                      data-testid={`button-dept-${dept.replace(/\s+/g, '-').toLowerCase()}`}
                                    >
                                      {dept} ({selectedCount}/{workerIds.length})
                                    </Button>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* Selección rápida por Cargo Actual - Auto-llena el nombre del perfil */}
                          {Object.keys(positionGroups).length > 1 && (
                            <div className="mb-3 pb-2 border-b">
                              <p className="text-xs font-medium text-muted-foreground mb-2">
                                Selección rápida por Cargo Actual: 
                                <span className="text-green-600 ml-1">(Seleccionar un cargo auto-llena el nombre)</span>
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {Object.entries(positionGroups).map(([pos, posWorkers]) => {
                                  const workerIds = posWorkers.map(w => w.id);
                                  const selectedCount = countSelectedInGroup(workerIds);
                                  const allPosSelected = selectedCount === workerIds.length;
                                  return (
                                    <Button
                                      key={pos}
                                      type="button"
                                      variant={allPosSelected ? "default" : "outline"}
                                      size="sm"
                                      className="text-xs h-7"
                                      onClick={() => togglePositionGroup(pos, workerIds)}
                                      data-testid={`button-pos-${pos.replace(/\s+/g, '-').toLowerCase()}`}
                                    >
                                      {pos} ({selectedCount}/{workerIds.length})
                                    </Button>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          <ScrollArea className="h-[150px]">
                            <div className="space-y-2">
                              {filteredWorkers.map((worker) => (
                              <div key={worker.id} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`worker-${worker.id}`}
                                  checked={selectedWorkerIds.includes(worker.id)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setSelectedWorkerIds(prev => [...prev, worker.id]);
                                    } else {
                                      setSelectedWorkerIds(prev => prev.filter(id => id !== worker.id));
                                    }
                                  }}
                                  data-testid={`checkbox-worker-${worker.id}`}
                                />
                                <label
                                  htmlFor={`worker-${worker.id}`}
                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                >
                                  {worker.name} - {worker.position || "Sin cargo asignado"}
                                </label>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                        </>
                      );
                    })()}
                  </div>
                  {selectedWorkerIds.length > 0 && (
                    <p className="text-xs text-green-600 font-medium">
                      {selectedWorkerIds.length} trabajador(es) seleccionado(s) - Se les asignará el perfil "{formData.name || 'seleccionado'}" al guardar
                    </p>
                  )}
                </div>

                <div className="space-y-2 col-span-2">
                  <Label htmlFor="description">Descripción de Funciones *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descripción detallada de las funciones y responsabilidades"
                    required
                    rows={3}
                    data-testid="input-profile-description"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="riskClass">Clase de Riesgo ARL *</Label>
                  <Select
                    value={formData.riskClass}
                    onValueChange={(value: any) => {
                      setFormData(prev => ({ 
                        ...prev, 
                        riskClass: value,
                        examFrequencyMonths: examFrequencyByRisk[value as keyof typeof examFrequencyByRisk]
                      }));
                    }}
                  >
                    <SelectTrigger id="riskClass" data-testid="select-risk-class">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="I">Clase I - Riesgo Mínimo ({getArlRate("I").initialRate}%)</SelectItem>
                      <SelectItem value="II">Clase II - Riesgo Bajo ({getArlRate("II").initialRate}%)</SelectItem>
                      <SelectItem value="III">Clase III - Riesgo Medio ({getArlRate("III").initialRate}%)</SelectItem>
                      <SelectItem value="IV">Clase IV - Riesgo Alto ({getArlRate("IV").initialRate}%)</SelectItem>
                      <SelectItem value="V">Clase V - Riesgo Máximo ({getArlRate("V").initialRate}%)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {getArlRate(formData.riskClass).description}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="examFrequency">Frecuencia Exámenes (meses)</Label>
                  <Input
                    id="examFrequency"
                    type="number"
                    value={formData.examFrequencyMonths}
                    onChange={(e) => setFormData(prev => ({ ...prev, examFrequencyMonths: e.target.value === '' ? '' : e.target.value }))}
                    min={1}
                    data-testid="input-exam-frequency"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="physicalDemands">Demandas Físicas</Label>
                  <Textarea
                    id="physicalDemands"
                    value={formData.physicalDemands}
                    onChange={(e) => setFormData(prev => ({ ...prev, physicalDemands: e.target.value }))}
                    placeholder="Ej: Levantamiento de carga, trabajo de pie prolongado"
                    rows={2}
                    data-testid="input-physical-demands"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mentalDemands">Demandas Mentales/Cognitivas</Label>
                  <Textarea
                    id="mentalDemands"
                    value={formData.mentalDemands}
                    onChange={(e) => setFormData(prev => ({ ...prev, mentalDemands: e.target.value }))}
                    placeholder="Ej: Atención sostenida, toma de decisiones rápidas"
                    rows={2}
                    data-testid="input-mental-demands"
                  />
                </div>
              </div>

              <ArrayInput
                label="Factores de Riesgo Específicos"
                value={formData.riskFactors}
                onChange={(newArray) => setFormData(prev => ({ ...prev, riskFactors: newArray }))}
                placeholder="Ej: Exposición a ruido, trabajo en altura"
                testId="risk-factor"
              />

              <ArrayInput
                label="Elementos de Protección Personal (EPP)"
                value={formData.requiredPpe}
                onChange={(newArray) => setFormData(prev => ({ ...prev, requiredPpe: newArray }))}
                placeholder="Ej: Casco, guantes, gafas de seguridad"
                testId="ppe"
              />

              <ArrayInput
                label="Exámenes Médicos Requeridos"
                value={formData.requiredExams}
                onChange={(newArray) => setFormData(prev => ({ ...prev, requiredExams: newArray }))}
                placeholder="Ej: Audiometría, espirometría, optometría"
                testId="exam"
              />

              <ArrayInput
                label="Capacitaciones Obligatorias"
                value={formData.requiredTrainings}
                onChange={(newArray) => setFormData(prev => ({ ...prev, requiredTrainings: newArray }))}
                placeholder="Ej: Trabajo en altura, manejo de químicos"
                testId="training"
              />

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setDialogOpen(false);
                    setEditingProfile(null);
                    resetForm();
                  }}
                  data-testid="button-cancel"
                >
                  Cancelar
                </Button>
                <Button type="submit" data-testid="button-save">
                  {editingProfile ? "Actualizar" : "Crear"} Perfil
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

          {/* Bulk Delete Button - only show when a specific company is selected and has profiles */}
          {(() => {
            const targetCompanyId = hasGlobalCompanyAccess ? selectedCompanyId : user?.companyId;
            const companyProfiles = targetCompanyId && targetCompanyId !== "all" 
              ? profiles.filter(p => p.companyId === targetCompanyId)
              : [];
            const targetCompany = companies.find(c => c.id === targetCompanyId);
            
            if (targetCompanyId && targetCompanyId !== "all" && companyProfiles.length > 0) {
              return (
                <Button 
                  variant="destructive"
                  className="bg-red-600 hover:bg-red-700"
                  data-testid="button-bulk-delete-profiles"
                  onClick={() => {
                    setBulkDeleteDialogOpen(true);
                    setBulkDeleteConfirmCode("");
                    setBulkDeleteCompanyName("");
                    setBulkDeleteResults(null);
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Eliminar Todos
                </Button>
              );
            }
            return null;
          })()}

          {/* Bulk Delete Confirmation Dialog */}
          <Dialog open={bulkDeleteDialogOpen} onOpenChange={(open) => {
            if (!open) {
              setBulkDeleteDialogOpen(false);
              setBulkDeleteConfirmCode("");
              setBulkDeleteCompanyName("");
              setBulkDeleteResults(null);
            }
          }}>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto" data-testid="dialog-bulk-delete-profiles">
              <div className="bg-red-600 -m-6 mb-4 p-6 rounded-t-lg">
                <DialogHeader>
                  <DialogTitle className="text-white flex items-center gap-2 text-xl">
                    <AlertTriangle className="h-6 w-6" />
                    ¡ADVERTENCIA! ACCIÓN IRREVERSIBLE
                  </DialogTitle>
                  <DialogDescription className="text-red-100">
                    Esta operación eliminará PERMANENTEMENTE todos los perfiles de cargo de esta empresa. No se puede deshacer.
                  </DialogDescription>
                </DialogHeader>
              </div>
              
              {bulkDeleteResults ? (
                <div className="space-y-4">
                  <div className={`p-4 rounded-lg ${bulkDeleteResults.errors && bulkDeleteResults.errors.length > 0 ? 'bg-yellow-50 border border-yellow-200' : 'bg-green-50 border border-green-200'}`}>
                    <p className="font-medium">{bulkDeleteResults.message}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {bulkDeleteResults.deleted} de {bulkDeleteResults.total} perfiles eliminados
                    </p>
                  </div>
                  {bulkDeleteResults.errors && bulkDeleteResults.errors.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-red-600">Perfiles no eliminados:</p>
                      <ScrollArea className="h-32 border rounded-md p-2">
                        {bulkDeleteResults.errors.map((err, idx) => (
                          <p key={idx} className="text-sm text-red-600">{err}</p>
                        ))}
                      </ScrollArea>
                    </div>
                  )}
                  <Button 
                    onClick={() => {
                      setBulkDeleteDialogOpen(false);
                      setBulkDeleteResults(null);
                    }}
                    className="w-full"
                  >
                    Cerrar
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {(() => {
                    const targetCompanyId = hasGlobalCompanyAccess ? selectedCompanyId : user?.companyId;
                    const companyProfiles = targetCompanyId && targetCompanyId !== "all" 
                      ? profiles.filter(p => p.companyId === targetCompanyId)
                      : [];
                    const targetCompany = companies.find(c => c.id === targetCompanyId);
                    
                    const codeMatches = bulkDeleteConfirmCode === "ELIMINAR-TODOS-LOS-PERFILES";
                    const nameMatches = targetCompany && bulkDeleteCompanyName === targetCompany.name;
                    
                    return (
                      <>
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                          <div className="flex items-center gap-2 text-red-700 dark:text-red-400 mb-2">
                            <AlertCircle className="h-5 w-5" />
                            <span className="font-semibold">Se eliminarán:</span>
                          </div>
                          <p className="text-lg font-bold text-red-700 dark:text-red-400">
                            {companyProfiles.length} perfil(es) de cargo
                          </p>
                          <p className="text-sm text-red-600 dark:text-red-400">
                            Empresa: {targetCompany?.name || "Desconocida"}
                          </p>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="confirm-code">
                            Escriba el código de confirmación: <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm">ELIMINAR-TODOS-LOS-PERFILES</code>
                          </Label>
                          <div className="relative">
                            <Input
                              id="confirm-code"
                              value={bulkDeleteConfirmCode}
                              onChange={(e) => setBulkDeleteConfirmCode(e.target.value)}
                              placeholder="Escriba el código exactamente"
                              className={codeMatches ? "border-green-500 pr-10" : ""}
                              data-testid="input-bulk-delete-code"
                            />
                            {codeMatches && (
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">✓</span>
                            )}
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="confirm-company-name">
                            Escriba el nombre exacto de la empresa: <strong>{targetCompany?.name}</strong>
                          </Label>
                          <div className="relative">
                            <Input
                              id="confirm-company-name"
                              value={bulkDeleteCompanyName}
                              onChange={(e) => setBulkDeleteCompanyName(e.target.value)}
                              placeholder="Escriba el nombre de la empresa"
                              className={nameMatches ? "border-green-500 pr-10" : ""}
                              data-testid="input-bulk-delete-company-name"
                            />
                            {nameMatches && (
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">✓</span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex gap-2 pt-4">
                          <Button 
                            variant="outline" 
                            onClick={() => setBulkDeleteDialogOpen(false)}
                            className="flex-1"
                          >
                            Cancelar
                          </Button>
                          <Button
                            variant="destructive"
                            disabled={!codeMatches || !nameMatches || bulkDeleteProfilesMutation.isPending}
                            onClick={() => {
                              if (targetCompanyId && codeMatches && nameMatches) {
                                bulkDeleteProfilesMutation.mutate({
                                  companyId: targetCompanyId,
                                  confirmationCode: bulkDeleteConfirmCode,
                                  confirmCompanyName: bulkDeleteCompanyName,
                                });
                              }
                            }}
                            className="flex-1"
                            data-testid="button-confirm-bulk-delete"
                          >
                            {bulkDeleteProfilesMutation.isPending 
                              ? "Eliminando..." 
                              : `Eliminar Permanentemente ${companyProfiles.length} Perfiles`
                            }
                          </Button>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}
            </DialogContent>
          </Dialog>

          <Dialog open={bulkDialogOpen} onOpenChange={(open) => {
            setBulkDialogOpen(open);
            if (!open) {
              setSelectedPositions([]);
              setBulkDefaultRiskClass("I");
            }
          }}>
            <DialogTrigger asChild>
              <Button 
                variant="outline"
                data-testid="button-bulk-profile"
                onClick={() => {
                  setSelectedPositions([]);
                  setBulkDefaultRiskClass("I");
                  if (!hasGlobalCompanyAccess && user?.companyId) {
                    setBulkCompanyId(user.companyId);
                  }
                }}
              >
                <Layers className="h-4 w-4 mr-2" />
                Creación Masiva
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="dialog-bulk-profiles">
              <DialogHeader>
                <DialogTitle>Creación Masiva de Perfiles de Cargo</DialogTitle>
                <DialogDescription>
                  Cree múltiples perfiles de cargo a partir de los cargos existentes en sus trabajadores
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {hasGlobalCompanyAccess && (
                  <div className="space-y-2">
                    <Label htmlFor="bulk-company">Empresa *</Label>
                    <Select
                      value={bulkCompanyId}
                      onValueChange={(value) => {
                        setBulkCompanyId(value);
                        setSelectedPositions([]);
                      }}
                    >
                      <SelectTrigger id="bulk-company" data-testid="select-bulk-company">
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
                  <Label htmlFor="default-risk-class">Clase de Riesgo Predeterminada</Label>
                  <p className="text-xs text-muted-foreground">
                    Se usará para cargos que no coincidan con perfiles predefinidos
                  </p>
                  <Select
                    value={bulkDefaultRiskClass}
                    onValueChange={(value: "I" | "II" | "III" | "IV" | "V") => setBulkDefaultRiskClass(value)}
                    data-testid="select-default-risk-class"
                  >
                    <SelectTrigger id="default-risk-class">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="I">Clase I - Riesgo Mínimo</SelectItem>
                      <SelectItem value="II">Clase II - Riesgo Bajo</SelectItem>
                      <SelectItem value="III">Clase III - Riesgo Medio</SelectItem>
                      <SelectItem value="IV">Clase IV - Riesgo Alto</SelectItem>
                      <SelectItem value="V">Clase V - Riesgo Máximo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Cargos sin Perfil Asignado</Label>
                  <p className="text-xs text-muted-foreground">
                    Seleccione los cargos para los cuales desea crear perfiles
                  </p>
                  <div className="border rounded-md p-3">
                    {(() => {
                      const companyId = hasGlobalCompanyAccess ? bulkCompanyId : (user?.companyId || "");
                      
                      if (!companyId) {
                        return (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            Seleccione primero una empresa
                          </p>
                        );
                      }
                      
                      // Check if company has any workers
                      const companyWorkers = workers.filter(w => w.companyId === companyId);
                      
                      if (companyWorkers.length === 0) {
                        return (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            No hay trabajadores registrados en esta empresa. Primero registre trabajadores con sus cargos para poder crear perfiles masivamente.
                          </p>
                        );
                      }
                      
                      const uniquePositions = getUniquePositionsWithoutProfiles(companyId);
                      
                      if (uniquePositions.length === 0) {
                        return (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            Todos los cargos de los {companyWorkers.length} trabajador(es) ya tienen un perfil de cargo creado.
                          </p>
                        );
                      }
                      
                      const allSelected = uniquePositions.length > 0 && 
                        uniquePositions.every(pos => selectedPositions.includes(pos));
                      
                      return (
                        <>
                          <div className="flex items-center justify-between mb-2 pb-2 border-b">
                            <span className="text-sm text-muted-foreground">
                              {uniquePositions.length} cargo(s) sin perfil
                            </span>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                if (allSelected) {
                                  setSelectedPositions([]);
                                } else {
                                  setSelectedPositions(uniquePositions);
                                }
                              }}
                              data-testid="button-select-all-positions"
                            >
                              {allSelected ? "Deseleccionar Todos" : "Seleccionar Todos"}
                            </Button>
                          </div>
                          <ScrollArea className="h-[200px]">
                            <div className="space-y-2">
                              {uniquePositions.map((position) => {
                                const isPredefined = position in PREDEFINED_PROFILES;
                                return (
                                  <div key={position} className="flex items-center space-x-2">
                                    <Checkbox
                                      id={`position-${position}`}
                                      checked={selectedPositions.includes(position)}
                                      onCheckedChange={(checked) => {
                                        if (checked) {
                                          setSelectedPositions(prev => [...prev, position]);
                                        } else {
                                          setSelectedPositions(prev => prev.filter(p => p !== position));
                                        }
                                      }}
                                      data-testid={`checkbox-position-${position.replace(/\s+/g, '-').toLowerCase()}`}
                                    />
                                    <label
                                      htmlFor={`position-${position}`}
                                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center gap-2"
                                    >
                                      {position}
                                      {isPredefined && (
                                        <Badge variant="outline" className="text-xs">
                                          Predefinido
                                        </Badge>
                                      )}
                                    </label>
                                  </div>
                                );
                              })}
                            </div>
                          </ScrollArea>
                        </>
                      );
                    })()}
                  </div>
                </div>

                {selectedPositions.length > 0 && (
                  <div className="p-3 bg-muted rounded-md">
                    <p className="text-sm font-medium">
                      Se crearán {selectedPositions.length} perfil(es) de cargo:
                    </p>
                    <ul className="text-sm text-muted-foreground mt-1 list-disc list-inside">
                      {selectedPositions.slice(0, 5).map(pos => (
                        <li key={pos}>{pos}</li>
                      ))}
                      {selectedPositions.length > 5 && (
                        <li>...y {selectedPositions.length - 5} más</li>
                      )}
                    </ul>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setBulkDialogOpen(false);
                      setSelectedPositions([]);
                    }}
                    data-testid="button-cancel-bulk"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleBulkCreate}
                    disabled={(hasGlobalCompanyAccess && !bulkCompanyId) || selectedPositions.length === 0 || batchCreateProfilesMutation.isPending}
                    data-testid="button-submit-bulk-profiles"
                  >
                    {batchCreateProfilesMutation.isPending ? "Creando..." : `Crear ${selectedPositions.length} Perfil(es)`}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button 
            variant="outline"
            onClick={() => {
              const companyId = hasGlobalCompanyAccess ? selectedCompanyId : (user?.companyId || "");
              if (!companyId) {
                toast({
                  title: "Error",
                  description: "Debe seleccionar una empresa",
                  variant: "destructive",
                });
                return;
              }
              syncWorkersMutation.mutate(companyId);
            }}
            disabled={syncWorkersMutation.isPending || (hasGlobalCompanyAccess && !selectedCompanyId)}
            data-testid="button-sync-workers"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${syncWorkersMutation.isPending ? 'animate-spin' : ''}`} />
            {syncWorkersMutation.isPending ? "Sincronizando..." : "Sincronizar Trabajadores"}
          </Button>
        </div>
      </div>

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

      <div className="flex items-center gap-4">
        <Input
          placeholder="Buscar perfil..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
          data-testid="input-search"
        />
      </div>

      {filteredProfiles.length === 0 ? (
        <div className="text-center text-muted-foreground py-12">
          No hay perfiles de cargo registrados
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredProfiles.map((profile) => (
            <Card key={profile.id} className="hover-elevate" data-testid={`card-profile-${profile.id}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 flex-1">
                    <Briefcase className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    <CardTitle className="text-base">{profile.name}</CardTitle>
                  </div>
                  <Badge className={`${getRiskColor(profile.riskClass)} text-white flex-shrink-0`}>
                    Clase {profile.riskClass}
                  </Badge>
                </div>
                <CardDescription className="line-clamp-2">{profile.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-muted-foreground">Tasa ARL:</span>
                  <span className="font-semibold">{getArlRate(profile.riskClass).initialRate}%</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-muted-foreground">Exámenes cada:</span>
                  <span className="font-semibold">{profile.examFrequencyMonths} meses</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-muted-foreground">Trabajadores asignados:</span>
                  <span className="font-semibold">
                    {workers.filter(w => 
                      w.companyId === profile.companyId && 
                      (w.jobProfileId === profile.id || w.position === profile.name)
                    ).length}
                  </span>
                </div>
                {profile.riskFactors && profile.riskFactors.length > 0 && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <AlertCircle className="h-4 w-4 flex-shrink-0" />
                      <span>Factores de riesgo:</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {profile.riskFactors.slice(0, 3).map((factor, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {factor}
                        </Badge>
                      ))}
                      {profile.riskFactors.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{profile.riskFactors.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleEdit(profile)}
                    data-testid={`button-edit-${profile.id}`}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      window.open(`/api/job-profiles/${profile.id}/pdf`, '_blank');
                    }}
                    data-testid={`button-pdf-${profile.id}`}
                    title="Descargar PDF"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteClick(profile)}
                    data-testid={`button-delete-${profile.id}`}
                    title="Eliminar"
                    className="text-destructive hover:bg-destructive/10"
                  >
                    Eliminar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {profileToDelete ? `Eliminar: ${profileToDelete.name}` : "Eliminar perfil"}
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                {isLoadingReferences ? (
                  <p>Verificando referencias...</p>
                ) : profileReferences ? (
                  <>
                    {(() => {
                      const refs = profileReferences.references;
                      const totalRefs = refs.workers + refs.medicalExams + refs.altoRiesgo + refs.contracts + refs.designaciones;
                      
                      if (totalRefs === 0) {
                        return <p>Este perfil no tiene registros asociados y puede eliminarse de forma segura.</p>;
                      }
                      
                      return (
                        <>
                          <p className="font-medium text-destructive">Este perfil tiene registros asociados:</p>
                          <ul className="list-disc list-inside space-y-1 text-sm">
                            {refs.workers > 0 && <li>{refs.workers} trabajador(es)</li>}
                            {refs.medicalExams > 0 && <li>{refs.medicalExams} examen(es) médico(s)</li>}
                            {refs.altoRiesgo > 0 && <li>{refs.altoRiesgo} designación(es) de alto riesgo</li>}
                            {refs.contracts > 0 && <li>{refs.contracts} contrato(s)</li>}
                            {refs.designaciones > 0 && <li>{refs.designaciones} designación(es) de responsable</li>}
                          </ul>
                          
                          {profileReferences.canForceDeleteWorkers ? (
                            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-3 mt-2">
                              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                                Puede eliminar este perfil desasociando los trabajadores
                              </p>
                              <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                                Los {refs.workers} trabajador(es) quedarán sin perfil de cargo asignado.
                              </p>
                            </div>
                          ) : (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3 mt-2">
                              <p className="text-sm font-medium text-red-800 dark:text-red-200">
                                No se puede eliminar este perfil
                              </p>
                              <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                                Debe eliminar o reasignar los exámenes médicos, contratos y designaciones primero.
                              </p>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </>
                ) : (
                  <p>¿Está seguro de eliminar este perfil?</p>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setProfileToDelete(null);
              setProfileReferences(null);
            }}>
              Cancelar
            </AlertDialogCancel>
            {profileReferences && (() => {
              const refs = profileReferences.references;
              const totalRefs = refs.workers + refs.medicalExams + refs.altoRiesgo + refs.contracts + refs.designaciones;
              
              if (totalRefs === 0) {
                return (
                  <AlertDialogAction
                    onClick={() => profileToDelete && deleteProfileMutation.mutate({ id: profileToDelete.id })}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    disabled={deleteProfileMutation.isPending}
                  >
                    {deleteProfileMutation.isPending ? "Eliminando..." : "Eliminar"}
                  </AlertDialogAction>
                );
              }
              
              if (profileReferences.canForceDeleteWorkers) {
                return (
                  <AlertDialogAction
                    onClick={() => profileToDelete && deleteProfileMutation.mutate({ id: profileToDelete.id, forceDisassociateWorkers: true })}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    disabled={deleteProfileMutation.isPending}
                  >
                    {deleteProfileMutation.isPending ? "Eliminando..." : "Desasociar y eliminar"}
                  </AlertDialogAction>
                );
              }
              
              return null;
            })()}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
