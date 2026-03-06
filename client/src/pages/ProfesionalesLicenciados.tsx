import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { 
  Pencil, 
  Building2, 
  Award, 
  Users, 
  Plus, 
  Trash2,
  Phone,
  Mail,
  Calendar,
  FileCheck,
  Loader2,
  Upload,
  Search,
  ArrowLeft,
  ChevronRight,
  KeyRound,
  ImageOff,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { z } from "zod";
import type { Company, User } from "@shared/schema";
import { useUpload } from "@/hooks/use-upload";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const SST_PROFESSION_OPTIONS = [
  { value: "medico_ocupacional", label: "Médico Ocupacional" },
  { value: "profesional_sst", label: "Profesional SST" },
  { value: "tecnologo_sst", label: "Tecnólogo SST" },
  { value: "tecnico_sst", label: "Técnico SST" },
  { value: "fisioterapeuta", label: "Fisioterapeuta" },
  { value: "psicologo_sst", label: "Psicólogo SST" },
  { value: "fonoaudiologo", label: "Fonoaudiólogo" },
  { value: "ingeniero_sst", label: "Ingeniero SST" },
  { value: "enfermero_sst", label: "Enfermero SST" },
  { value: "otro", label: "Otro" },
] as const;

const SST_LICENSE_STATUS_OPTIONS = [
  { value: "vigente", label: "Vigente" },
  { value: "vencida", label: "Vencida" },
  { value: "pendiente_verificacion", label: "Pendiente de Verificación" },
  { value: "suspendida", label: "Suspendida" },
  { value: "sin_configurar", label: "Sin configurar" },
] as const;

const editFormSchema = z.object({
  fullName: z.string().min(1, "El nombre es requerido"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  sstPhone: z.string().optional().nullable(),
  sstProfessionType: z.string().optional().nullable(),
  sstLicenseNumber: z.string().optional().nullable(),
  sstLicenseIssuer: z.string().optional().nullable(),
  sstLicenseIssuedAt: z.string().optional().nullable(),
  sstLicenseExpiresAt: z.string().optional().nullable(),
  sstLicenseStatus: z.string().optional().nullable(),
  sstSignatureUrl: z.string().optional().nullable(),
});

type EditFormData = z.infer<typeof editFormSchema>;

interface Assignment {
  id: string;
  companyId: string;
  companyName: string;
  companyNit: string;
  assignedAt: string;
  isActive: boolean;
}

interface LicensedProfessional extends Omit<User, 'password'> {
  assignments: Assignment[];
}

export default function ProfesionalesLicenciados() {
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [assignmentsDialogOpen, setAssignmentsDialogOpen] = useState(false);
  const [selectedProfessional, setSelectedProfessional] = useState<LicensedProfessional | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [companyFilter, setCompanyFilter] = useState<string>("all");
  const [selectedCompanyToAdd, setSelectedCompanyToAdd] = useState<string>("");
  const { uploadFile, isUploading: isUploadingSignature } = useUpload();

  const [vaultSearchTerm, setVaultSearchTerm] = useState("");
  const [selectedVaultProfessional, setSelectedVaultProfessional] = useState<LicensedProfessional | null>(null);
  const [confirmResetPassword, setConfirmResetPassword] = useState(false);
  const [confirmDeleteSignature, setConfirmDeleteSignature] = useState(false);

  const isSuperadmin = currentUser?.role === 'superadmin';

  const { data: professionals, isLoading } = useQuery<LicensedProfessional[]>({
    queryKey: ["/api/licensed-professionals"],
  });

  const { data: companies } = useQuery<Company[]>({
    queryKey: ["/api/companies"],
    enabled: isSuperadmin,
  });

  const filteredProfessionals = useMemo(() => {
    if (!professionals) return [];
    
    return professionals.filter((prof) => {
      if (statusFilter !== "all") {
        if (statusFilter === "sin_configurar") {
          if (prof.sstLicenseStatus) {
            return false;
          }
        } else if (prof.sstLicenseStatus !== statusFilter) {
          return false;
        }
      }
      if (companyFilter !== "all") {
        const hasCompany = prof.assignments.some(a => a.companyId === companyFilter && a.isActive);
        if (!hasCompany) return false;
      }
      return true;
    });
  }, [professionals, statusFilter, companyFilter]);

  const vaultFilteredProfessionals = useMemo(() => {
    if (!professionals) return [];
    const term = vaultSearchTerm.toLowerCase().trim();
    if (!term) return professionals;
    return professionals.filter((prof) => {
      const name = (prof.fullName || prof.username || "").toLowerCase();
      const license = (prof.sstLicenseNumber || "").toLowerCase();
      return name.includes(term) || license.includes(term);
    });
  }, [professionals, vaultSearchTerm]);

  const form = useForm<EditFormData>({
    resolver: zodResolver(editFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      sstPhone: "",
      sstProfessionType: null,
      sstLicenseNumber: "",
      sstLicenseIssuer: "",
      sstLicenseIssuedAt: "",
      sstLicenseExpiresAt: "",
      sstLicenseStatus: null,
      sstSignatureUrl: "",
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: EditFormData }) => {
      return await apiRequest("PATCH", `/api/licensed-professionals/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/licensed-professionals"] });
      toast({
        title: "Profesional actualizado",
        description: "Los datos del profesional han sido actualizados exitosamente",
      });
      setEditDialogOpen(false);
      setSelectedProfessional(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const addAssignmentMutation = useMutation({
    mutationFn: async ({ professionalId, companyId }: { professionalId: string; companyId: string }) => {
      return await apiRequest("POST", `/api/licensed-professionals/${professionalId}/assignments`, { companyId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/licensed-professionals"] });
      toast({
        title: "Asignación creada",
        description: "El profesional ha sido asignado a la empresa exitosamente",
      });
      setSelectedCompanyToAdd("");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const removeAssignmentMutation = useMutation({
    mutationFn: async ({ professionalId, companyId }: { professionalId: string; companyId: string }) => {
      return await apiRequest("DELETE", `/api/licensed-professionals/${professionalId}/assignments/${companyId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/licensed-professionals"] });
      toast({
        title: "Asignación removida",
        description: "La asignación ha sido removida exitosamente",
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

  const resetPasswordMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("POST", `/api/admin/portal-lso/users/${id}/reset-password`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/licensed-professionals"] });
      toast({
        title: "Contraseña reseteada",
        description: "La contraseña ha sido reseteada exitosamente",
      });
      setConfirmResetPassword(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteSignatureMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/admin/portal-lso/users/${id}/signature`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/licensed-professionals"] });
      toast({
        title: "Firma eliminada",
        description: "La firma digital ha sido eliminada exitosamente",
      });
      setConfirmDeleteSignature(false);
      if (selectedVaultProfessional) {
        setSelectedVaultProfessional({ ...selectedVaultProfessional, sstSignatureUrl: null });
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

  const handleEdit = (professional: LicensedProfessional) => {
    setSelectedProfessional(professional);
    form.reset({
      fullName: professional.fullName || "",
      email: professional.email || "",
      sstPhone: professional.sstPhone || "",
      sstProfessionType: professional.sstProfessionType || null,
      sstLicenseNumber: professional.sstLicenseNumber || "",
      sstLicenseIssuer: professional.sstLicenseIssuer || "",
      sstLicenseIssuedAt: professional.sstLicenseIssuedAt || "",
      sstLicenseExpiresAt: professional.sstLicenseExpiresAt || "",
      sstLicenseStatus: professional.sstLicenseStatus || null,
      sstSignatureUrl: professional.sstSignatureUrl || "",
    });
    setEditDialogOpen(true);
  };

  const handleViewAssignments = (professional: LicensedProfessional) => {
    setSelectedProfessional(professional);
    setAssignmentsDialogOpen(true);
  };

  const handleSubmit = (data: EditFormData) => {
    if (!selectedProfessional) return;
    updateMutation.mutate({ id: selectedProfessional.id, data });
  };

  const handleAddAssignment = () => {
    if (!selectedProfessional || !selectedCompanyToAdd) return;
    addAssignmentMutation.mutate({
      professionalId: selectedProfessional.id,
      companyId: selectedCompanyToAdd,
    });
  };

  const handleRemoveAssignment = (companyId: string) => {
    if (!selectedProfessional) return;
    removeAssignmentMutation.mutate({
      professionalId: selectedProfessional.id,
      companyId,
    });
  };

  const handleVaultRemoveAssignment = (companyId: string) => {
    if (!selectedVaultProfessional) return;
    removeAssignmentMutation.mutate({
      professionalId: selectedVaultProfessional.id,
      companyId,
    });
  };

  const handleSignatureUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const response = await uploadFile(file);
    if (response) {
      form.setValue("sstSignatureUrl", response.objectPath);
      toast({
        title: "Firma subida",
        description: "La firma ha sido subida exitosamente",
      });
    }
  };

  const getLicenseStatusBadge = (status: string | null | undefined) => {
    const statusConfig: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      vigente: { variant: "default", label: "Vigente" },
      vencida: { variant: "destructive", label: "Vencida" },
      pendiente_verificacion: { variant: "secondary", label: "Pendiente de Verificación" },
      suspendida: { variant: "destructive", label: "Suspendida" },
    };
    
    const config = statusConfig[status || ""] || { variant: "outline" as const, label: "Sin estado" };
    return (
      <Badge variant={config.variant} data-testid={`badge-status-${status}`}>
        {config.label}
      </Badge>
    );
  };

  const getProfessionLabel = (type: string | null | undefined) => {
    const option = SST_PROFESSION_OPTIONS.find(o => o.value === type);
    return option?.label || type || "No especificado";
  };

  const availableCompaniesToAdd = useMemo(() => {
    if (!companies || !selectedProfessional) return [];
    const assignedCompanyIds = new Set(
      selectedProfessional.assignments.filter(a => a.isActive).map(a => a.companyId)
    );
    return companies.filter(c => !assignedCompanyIds.has(c.id));
  }, [companies, selectedProfessional]);

  const availableCompaniesToAddVault = useMemo(() => {
    if (!companies || !selectedVaultProfessional) return [];
    const assignedCompanyIds = new Set(
      selectedVaultProfessional.assignments.filter(a => a.isActive).map(a => a.companyId)
    );
    return companies.filter(c => !assignedCompanyIds.has(c.id));
  }, [companies, selectedVaultProfessional]);

  const handleVaultAddAssignment = () => {
    if (!selectedVaultProfessional || !selectedCompanyToAdd) return;
    addAssignmentMutation.mutate({
      professionalId: selectedVaultProfessional.id,
      companyId: selectedCompanyToAdd,
    });
  };

  const handleOpenVaultDetail = (professional: LicensedProfessional) => {
    setSelectedVaultProfessional(professional);
  };

  const handleEditFromVault = (professional: LicensedProfessional) => {
    setSelectedProfessional(professional);
    form.reset({
      fullName: professional.fullName || "",
      email: professional.email || "",
      sstPhone: professional.sstPhone || "",
      sstProfessionType: professional.sstProfessionType || null,
      sstLicenseNumber: professional.sstLicenseNumber || "",
      sstLicenseIssuer: professional.sstLicenseIssuer || "",
      sstLicenseIssuedAt: professional.sstLicenseIssuedAt || "",
      sstLicenseExpiresAt: professional.sstLicenseExpiresAt || "",
      sstLicenseStatus: professional.sstLicenseStatus || null,
      sstSignatureUrl: professional.sstSignatureUrl || "",
    });
    setEditDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isSuperadmin && selectedVaultProfessional) {
    const prof = professionals?.find(p => p.id === selectedVaultProfessional.id) || selectedVaultProfessional;
    const activeAssignments = prof.assignments.filter(a => a.isActive);

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => setSelectedVaultProfessional(null)}
            data-testid="button-back-to-vaults"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a profesionales
          </Button>
        </div>

        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-3xl font-bold" data-testid="text-vault-detail-title">
              {prof.fullName || prof.username}
            </h1>
            <p className="text-muted-foreground">
              {getProfessionLabel(prof.sstProfessionType)}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              onClick={() => handleEditFromVault(prof)}
              data-testid="button-vault-edit-license"
            >
              <Pencil className="mr-2 h-4 w-4" />
              Editar datos
            </Button>
            <Button
              variant="outline"
              onClick={() => setConfirmResetPassword(true)}
              data-testid="button-vault-reset-password"
            >
              <KeyRound className="mr-2 h-4 w-4" />
              Resetear contraseña
            </Button>
            {prof.sstSignatureUrl && (
              <Button
                variant="outline"
                onClick={() => setConfirmDeleteSignature(true)}
                data-testid="button-vault-delete-signature"
              >
                <ImageOff className="mr-2 h-4 w-4" />
                Borrar firma
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="h-4 w-4" />
                Datos Personales
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between gap-2">
                <span className="text-sm text-muted-foreground">Nombre</span>
                <span className="text-sm font-medium" data-testid="text-vault-fullname">{prof.fullName || "-"}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-sm text-muted-foreground">Usuario</span>
                <span className="text-sm font-medium" data-testid="text-vault-username">{prof.username}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-sm text-muted-foreground">Email</span>
                <span className="text-sm font-medium" data-testid="text-vault-email">
                  {prof.email ? (
                    <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{prof.email}</span>
                  ) : "-"}
                </span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-sm text-muted-foreground">Teléfono</span>
                <span className="text-sm font-medium" data-testid="text-vault-phone">
                  {prof.sstPhone ? (
                    <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{prof.sstPhone}</span>
                  ) : "-"}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileCheck className="h-4 w-4" />
                Datos de Licencia
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between gap-2">
                <span className="text-sm text-muted-foreground">Profesión SST</span>
                <span className="text-sm font-medium" data-testid="text-vault-profession">{getProfessionLabel(prof.sstProfessionType)}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-sm text-muted-foreground">No. Licencia</span>
                <span className="text-sm font-medium" data-testid="text-vault-license-number">{prof.sstLicenseNumber || "-"}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-sm text-muted-foreground">Entidad Emisora</span>
                <span className="text-sm font-medium" data-testid="text-vault-license-issuer">{prof.sstLicenseIssuer || "-"}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-sm text-muted-foreground">Estado</span>
                <span data-testid="text-vault-license-status">{getLicenseStatusBadge(prof.sstLicenseStatus)}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-sm text-muted-foreground">Expedición</span>
                <span className="text-sm font-medium" data-testid="text-vault-license-issued">
                  {prof.sstLicenseIssuedAt
                    ? format(new Date(prof.sstLicenseIssuedAt), "dd/MM/yyyy", { locale: es })
                    : "-"}
                </span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-sm text-muted-foreground">Vencimiento</span>
                <span className="text-sm font-medium" data-testid="text-vault-license-expires">
                  {prof.sstLicenseExpiresAt
                    ? format(new Date(prof.sstLicenseExpiresAt), "dd/MM/yyyy", { locale: es })
                    : "-"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Award className="h-4 w-4" />
              Firma Digital
            </CardTitle>
          </CardHeader>
          <CardContent>
            {prof.sstSignatureUrl ? (
              <div className="border rounded-md p-4 bg-muted/30 inline-block" data-testid="img-vault-signature">
                <img
                  src={prof.sstSignatureUrl}
                  alt="Firma digital"
                  className="max-h-24 object-contain"
                />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground" data-testid="text-vault-no-signature">
                No tiene firma digital configurada
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Building2 className="h-4 w-4" />
              Empresas Asignadas ({activeAssignments.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeAssignments.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4" data-testid="text-vault-no-assignments">
                No hay empresas asignadas
              </p>
            ) : (
              <div className="space-y-2">
                {activeAssignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="flex items-center justify-between p-3 border rounded-md"
                    data-testid={`vault-assignment-${assignment.companyId}`}
                  >
                    <div>
                      <p className="font-medium text-sm">{assignment.companyName}</p>
                      <p className="text-xs text-muted-foreground">NIT: {assignment.companyNit}</p>
                      <p className="text-xs text-muted-foreground">
                        Asignado: {format(new Date(assignment.assignedAt), "dd/MM/yyyy", { locale: es })}
                      </p>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleVaultRemoveAssignment(assignment.companyId)}
                      disabled={removeAssignmentMutation.isPending}
                      data-testid={`button-vault-remove-assignment-${assignment.companyId}`}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {availableCompaniesToAddVault.length > 0 && (
              <div className="space-y-2 pt-4 border-t">
                <h4 className="text-sm font-medium">Agregar Nueva Asignación</h4>
                <div className="flex gap-2">
                  <Select value={selectedCompanyToAdd} onValueChange={setSelectedCompanyToAdd}>
                    <SelectTrigger className="flex-1" data-testid="select-vault-add-company">
                      <SelectValue placeholder="Seleccionar empresa" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableCompaniesToAddVault.map((company) => (
                        <SelectItem key={company.id} value={company.id}>
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={handleVaultAddAssignment}
                    disabled={!selectedCompanyToAdd || addAssignmentMutation.isPending}
                    data-testid="button-vault-add-assignment"
                  >
                    {addAssignmentMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <AlertDialog open={confirmResetPassword} onOpenChange={setConfirmResetPassword}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Resetear contraseña</AlertDialogTitle>
              <AlertDialogDescription>
                Se reseteará la contraseña de {prof.fullName || prof.username}. 
                La nueva contraseña será el nombre de usuario del profesional.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel data-testid="button-cancel-reset-password">Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => resetPasswordMutation.mutate(prof.id)}
                disabled={resetPasswordMutation.isPending}
                data-testid="button-confirm-reset-password"
              >
                {resetPasswordMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Resetear
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={confirmDeleteSignature} onOpenChange={setConfirmDeleteSignature}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Eliminar firma digital</AlertDialogTitle>
              <AlertDialogDescription>
                Se eliminará la firma digital de {prof.fullName || prof.username}. 
                Esta acción no se puede deshacer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel data-testid="button-cancel-delete-signature">Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteSignatureMutation.mutate(prof.id)}
                disabled={deleteSignatureMutation.isPending}
                data-testid="button-confirm-delete-signature"
              >
                {deleteSignatureMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {renderEditDialog()}
      </div>
    );
  }

  if (isSuperadmin) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-3xl font-bold" data-testid="text-page-title">
              Profesionales Licenciados en Salud Ocupacional
            </h1>
            <p className="text-muted-foreground">
              Gestión de profesionales con licencia SST (Resolución 0312/2019)
            </p>
          </div>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o número de licencia..."
            value={vaultSearchTerm}
            onChange={(e) => setVaultSearchTerm(e.target.value)}
            className="pl-9"
            data-testid="input-vault-search"
          />
        </div>

        {vaultFilteredProfessionals.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground" data-testid="text-no-professionals">
                {vaultSearchTerm
                  ? "No se encontraron profesionales con ese criterio"
                  : "No hay profesionales licenciados registrados"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vaultFilteredProfessionals.map((prof) => {
              const activeAssignments = prof.assignments.filter(a => a.isActive);
              return (
                <Card
                  key={prof.id}
                  className="hover-elevate cursor-pointer"
                  onClick={() => handleOpenVaultDetail(prof)}
                  data-testid={`card-vault-professional-${prof.id}`}
                >
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold truncate" data-testid={`text-vault-name-${prof.id}`}>
                          {prof.fullName || prof.username}
                        </h3>
                        <p className="text-sm text-muted-foreground truncate">
                          {getProfessionLabel(prof.sstProfessionType)}
                        </p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {getLicenseStatusBadge(prof.sstLicenseStatus)}
                      {prof.sstSignatureUrl ? (
                        <Badge variant="outline" className="gap-1" data-testid={`badge-vault-signature-${prof.id}`}>
                          <CheckCircle2 className="h-3 w-3" />
                          Firma
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="gap-1 text-muted-foreground" data-testid={`badge-vault-no-signature-${prof.id}`}>
                          <XCircle className="h-3 w-3" />
                          Sin firma
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-2 text-sm">
                      <Badge variant="outline" data-testid={`badge-vault-assignments-${prof.id}`}>
                        <Building2 className="h-3 w-3 mr-1" />
                        {activeAssignments.length} empresa{activeAssignments.length !== 1 ? 's' : ''}
                      </Badge>
                      {prof.sstLicenseExpiresAt && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1" data-testid={`text-vault-expires-${prof.id}`}>
                          <Calendar className="h-3 w-3" />
                          {format(new Date(prof.sstLicenseExpiresAt), "dd/MM/yyyy", { locale: es })}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {renderEditDialog()}
      </div>
    );
  }

  function renderEditDialog() {
    return (
      <>
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Editar Profesional Licenciado
              </DialogTitle>
              <DialogDescription>
                Actualiza los datos y credenciales SST del profesional
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre Completo</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-fullname" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" value={field.value || ""} data-testid="input-email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="sstPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teléfono de Contacto</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} data-testid="input-phone" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4 rounded-lg border p-4 bg-muted/30">
                  <div className="flex items-center gap-2 text-sm font-medium text-primary">
                    <FileCheck className="h-4 w-4" />
                    <span>Credenciales SST (Resolución 0312/2019)</span>
                  </div>

                  <FormField
                    control={form.control}
                    name="sstProfessionType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Profesión SST</FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(value === "none" ? null : value)}
                          value={field.value || "none"}
                        >
                          <FormControl>
                            <SelectTrigger data-testid="select-profession-type">
                              <SelectValue placeholder="Seleccionar tipo de profesión" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">No especificado</SelectItem>
                            {SST_PROFESSION_OPTIONS.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="sstLicenseNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Número de Licencia</FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value || ""} data-testid="input-license-number" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="sstLicenseIssuer"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Entidad Emisora</FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value || ""} placeholder="Ej: Secretaría de Salud" data-testid="input-license-issuer" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="sstLicenseIssuedAt"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fecha de Expedición</FormLabel>
                          <FormControl>
                            <Input {...field} type="date" value={field.value || ""} data-testid="input-license-issued" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="sstLicenseExpiresAt"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fecha de Vencimiento</FormLabel>
                          <FormControl>
                            <Input {...field} type="date" value={field.value || ""} data-testid="input-license-expires" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="sstLicenseStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado de la Licencia</FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(value === "none" ? null : value)}
                          value={field.value || "none"}
                        >
                          <FormControl>
                            <SelectTrigger data-testid="select-license-status">
                              <SelectValue placeholder="Seleccionar estado" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">Sin estado</SelectItem>
                            {SST_LICENSE_STATUS_OPTIONS.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
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
                    name="sstSignatureUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Firma Digital</FormLabel>
                        <FormControl>
                          <div className="space-y-2">
                            {field.value && (
                              <div className="border rounded-md p-2 bg-muted/50">
                                <img 
                                  src={field.value} 
                                  alt="Firma digital" 
                                  className="max-h-20 object-contain"
                                />
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <Input
                                type="file"
                                accept="image/*"
                                onChange={handleSignatureUpload}
                                disabled={isUploadingSignature}
                                data-testid="input-signature-upload"
                              />
                              {isUploadingSignature && <Loader2 className="h-4 w-4 animate-spin" />}
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditDialogOpen(false)}
                    data-testid="button-cancel-edit"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={updateMutation.isPending}
                    data-testid="button-save-edit"
                  >
                    {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Guardar Cambios
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">
            Profesionales Licenciados en Salud Ocupacional
          </h1>
          <p className="text-muted-foreground">
            Gestión de profesionales con licencia SST (Resolución 0312/2019)
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="w-[200px]">
              <label className="text-sm font-medium mb-1 block">Estado de Licencia</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger data-testid="select-filter-status">
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  {SST_LICENSE_STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {isSuperadmin && companies && (
              <div className="w-[250px]">
                <label className="text-sm font-medium mb-1 block">Empresa</label>
                <Select value={companyFilter} onValueChange={setCompanyFilter}>
                  <SelectTrigger data-testid="select-filter-company">
                    <SelectValue placeholder="Todas las empresas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las empresas</SelectItem>
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          {company.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Listado de Profesionales ({filteredProfessionals.length})
          </CardTitle>
          <CardDescription>
            Profesionales con rol LSO (Licenciado en Salud Ocupacional) registrados en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre Completo</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Tipo de Profesión</TableHead>
                  <TableHead>No. Licencia</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Vencimiento</TableHead>
                  <TableHead>Empresas</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProfessionals.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No se encontraron profesionales licenciados
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProfessionals.map((professional) => {
                    const activeAssignments = professional.assignments.filter(a => a.isActive);
                    return (
                      <TableRow key={professional.id} data-testid={`row-professional-${professional.id}`}>
                        <TableCell className="font-medium">
                          {professional.fullName || professional.username}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1 text-sm">
                            {professional.email && (
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Mail className="h-3 w-3" />
                                {professional.email}
                              </div>
                            )}
                            {professional.sstPhone && (
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Phone className="h-3 w-3" />
                                {professional.sstPhone}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{getProfessionLabel(professional.sstProfessionType)}</TableCell>
                        <TableCell>
                          {professional.sstLicenseNumber || (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>{getLicenseStatusBadge(professional.sstLicenseStatus)}</TableCell>
                        <TableCell>
                          {professional.sstLicenseExpiresAt ? (
                            <div className="flex items-center gap-1 text-sm">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(professional.sstLicenseExpiresAt), "dd/MM/yyyy", { locale: es })}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" data-testid={`badge-assignments-${professional.id}`}>
                            {activeAssignments.length} empresa{activeAssignments.length !== 1 ? 's' : ''}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleEdit(professional)}
                              data-testid={`button-edit-${professional.id}`}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleViewAssignments(professional)}
                              data-testid={`button-assignments-${professional.id}`}
                            >
                              <Building2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {renderEditDialog()}

      <Dialog open={assignmentsDialogOpen} onOpenChange={setAssignmentsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Asignaciones de Empresas
            </DialogTitle>
            <DialogDescription>
              {selectedProfessional?.fullName || selectedProfessional?.username}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Empresas Asignadas</h4>
              {selectedProfessional?.assignments.filter(a => a.isActive).length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No hay empresas asignadas
                </p>
              ) : (
                <div className="space-y-2">
                  {selectedProfessional?.assignments
                    .filter(a => a.isActive)
                    .map((assignment) => (
                      <div 
                        key={assignment.id} 
                        className="flex items-center justify-between p-3 border rounded-lg"
                        data-testid={`assignment-${assignment.companyId}`}
                      >
                        <div>
                          <p className="font-medium">{assignment.companyName}</p>
                          <p className="text-sm text-muted-foreground">NIT: {assignment.companyNit}</p>
                          <p className="text-xs text-muted-foreground">
                            Asignado: {format(new Date(assignment.assignedAt), "dd/MM/yyyy", { locale: es })}
                          </p>
                        </div>
                        {isSuperadmin && (
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleRemoveAssignment(assignment.companyId)}
                            disabled={removeAssignmentMutation.isPending}
                            data-testid={`button-remove-assignment-${assignment.companyId}`}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </div>

            {isSuperadmin && availableCompaniesToAdd.length > 0 && (
              <div className="space-y-2 pt-4 border-t">
                <h4 className="text-sm font-medium">Agregar Nueva Asignación</h4>
                <div className="flex gap-2">
                  <Select value={selectedCompanyToAdd} onValueChange={setSelectedCompanyToAdd}>
                    <SelectTrigger className="flex-1" data-testid="select-add-company">
                      <SelectValue placeholder="Seleccionar empresa" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableCompaniesToAdd.map((company) => (
                        <SelectItem key={company.id} value={company.id}>
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={handleAddAssignment}
                    disabled={!selectedCompanyToAdd || addAssignmentMutation.isPending}
                    data-testid="button-add-assignment"
                  >
                    {addAssignmentMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAssignmentsDialogOpen(false)}
              data-testid="button-close-assignments"
            >
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
