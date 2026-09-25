import { useEffect, useState, useMemo } from "react";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
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
import { insertUserSchema, type User, type UserRole, type Worker } from "@shared/schema";
import { roleLabels, roleDescriptions, hasGlobalAccess, getRolePermissions } from "@shared/permissions";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Plus, Pencil, Trash2, Shield, Info, Building2, Award, Search, X, ChevronRight, ArrowLeft, Users } from "lucide-react";
import { z } from "zod";
import type { Company } from "@shared/schema";
import { useLocation } from "wouter";

// Áreas/Departamentos típicos de empresas colombianas
const AREAS_EMPRESA = [
  "Administración",
  "Almacén",
  "Archivo",
  "Auditoría",
  "Calidad",
  "Comercial",
  "Compras",
  "Comunicaciones",
  "Contabilidad",
  "Control Interno",
  "Desarrollo",
  "Dirección General",
  "Diseño",
  "Financiera",
  "Gestión Documental",
  "Gestión Humana",
  "Importaciones",
  "Infraestructura",
  "Investigación y Desarrollo",
  "Jurídica",
  "Legal",
  "Logística",
  "Mantenimiento",
  "Marketing",
  "Mercadeo",
  "Nómina",
  "Operaciones",
  "Planeación",
  "Producción",
  "Proyectos",
  "Recursos Humanos",
  "Riesgos",
  "Seguridad",
  "Seguridad y Salud en el Trabajo",
  "Servicio al Cliente",
  "Servicios Generales",
  "Sistemas",
  "Sostenibilidad",
  "SST",
  "Talento Humano",
  "Tecnología",
  "Tesorería",
  "Ventas",
] as const;
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Roles que requieren credenciales SST
const SST_ROLES = ["coordinador_sst", "lso", "coordinador_salud", "responsable_sst"] as const;

// Opciones para tipo de profesión SST
const SST_PROFESSION_OPTIONS = [
  { value: "medico_ocupacional", label: "Médico Especialista en Salud Ocupacional" },
  { value: "profesional_sst", label: "Profesional con Posgrado en SST" },
  { value: "tecnologo_sst", label: "Tecnólogo en SST" },
  { value: "tecnico_sst", label: "Técnico en SST" },
  { value: "fisioterapeuta", label: "Fisioterapeuta" },
  { value: "psicologo_sst", label: "Psicólogo Especialista en SST" },
  { value: "fonoaudiologo", label: "Fonoaudiólogo" },
  { value: "ingeniero_sst", label: "Ingeniero con Especialización en SST" },
  { value: "enfermero_sst", label: "Enfermero con Formación en SST" },
  { value: "otro", label: "Otro Profesional con Licencia SST" },
] as const;

// Opciones para estado de licencia SST
const SST_LICENSE_STATUS_OPTIONS = [
  { value: "vigente", label: "Vigente" },
  { value: "vencida", label: "Vencida" },
  { value: "pendiente_verificacion", label: "Pendiente de Verificación" },
  { value: "suspendida", label: "Suspendida" },
] as const;

const userFormSchema = insertUserSchema.omit({ password: true }).extend({
  password: z.string().max(30, "La contraseña debe tener máximo 30 caracteres").optional().or(z.literal("")),
  sstProfessionType: z.string().optional().nullable(),
  sstLicenseNumber: z.string().optional().nullable(),
  sstLicenseIssuer: z.string().optional().nullable(),
  sstLicenseIssuedAt: z.string().optional().nullable(),
  sstLicenseExpiresAt: z.string().optional().nullable(),
  sstLicenseStatus: z.string().optional().nullable(),
});

type UserFormData = z.infer<typeof userFormSchema>;

type UserWithoutPassword = Omit<User, "password">;

const NO_WORKER_VALUE = "__no_worker__";

function buildWorkerUsername(workerName: string, existingUsers: UserWithoutPassword[] = []) {
  const nameParts = workerName.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter(Boolean);
  const baseUsername = nameParts.length >= 2
    ? `${nameParts[0]}_${nameParts[nameParts.length - 1]}`
    : nameParts[0] || "usuario";
  const existingUsernames = new Set(existingUsers.map((user) => user.username.toLowerCase()));
  if (!existingUsernames.has(baseUsername)) return baseUsername;

  let counter = 1;
  while (existingUsernames.has(`${baseUsername}${counter}`)) counter++;
  return `${baseUsername}${counter}`;
}

type MechanicSearchResult = {
  id: string;
  fullName: string | null;
  employerCompanyName: string | null;
};

type MechanicAccessGrant = {
  id: string;
  mechanicUserId: string;
  mechanicUsername: string;
  mechanicName: string | null;
  mechanicEmail: string | null;
  employerCompanyName: string | null;
  authorizedCompanyId: string;
  authorizedCompanyName: string | null;
  scope: string[];
  startDate: string;
  endDate: string | null;
  isActive: boolean;
  status: "pending" | "accepted" | "rejected" | "revoked" | "expired";
};

const MECHANIC_SCOPES = [
  { value: "maintenance", label: "Mantenimientos" },
  { value: "vehicles", label: "Vehículos" },
  { value: "inspections", label: "Inspecciones" },
] as const;

function MechanicAccessPanel() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [selectedMechanic, setSelectedMechanic] = useState<MechanicSearchResult | null>(null);
  const [startDate, setStartDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState("");
  const [scope, setScope] = useState<string[]>(["maintenance"]);
  const trimmedSearch = search.trim();
  const { data: results = [], isFetching: searching } = useQuery<MechanicSearchResult[]>({
    queryKey: ["/api/mechanic-access/search", trimmedSearch],
    enabled: trimmedSearch.length >= 1,
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/mechanic-access/search?cedula=${encodeURIComponent(trimmedSearch)}`);
      return response.json();
    },
  });
  const { data: grants = [] } = useQuery<MechanicAccessGrant[]>({
    queryKey: ["/api/mechanic-access"],
  });
  const createGrant = useMutation({
    mutationFn: async () => {
      if (!selectedMechanic) throw new Error("Selecciona un Técnico Mecánico");
      if (!startDate) throw new Error("La fecha de inicio es obligatoria");
      if (endDate && endDate < startDate) throw new Error("La fecha de finalización no puede ser anterior a la fecha de inicio");
      if (scope.length === 0) throw new Error("Selecciona al menos un alcance");
      await apiRequest("POST", "/api/mechanic-access", {
        mechanicUserId: selectedMechanic.id, startDate, endDate: endDate || null, scope,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mechanic-access"] });
      setSelectedMechanic(null);
      setSearch("");
      setEndDate("");
      setScope(["maintenance"]);
      toast({ title: "Invitación enviada", description: "El técnico debe aceptarla desde su cuenta." });
    },
    onError: (error: Error) => toast({ title: "No se pudo enviar la invitación", description: error.message, variant: "destructive" }),
  });
  const revokeGrant = useMutation({
    mutationFn: (id: string) => apiRequest("PATCH", `/api/mechanic-access/${id}/revoke`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mechanic-access"] });
      toast({ title: "Acceso revocado", description: "La autorización dejó de estar vigente." });
    },
    onError: (error: Error) => toast({ title: "No se pudo revocar", description: error.message, variant: "destructive" }),
  });
  const toggleScope = (value: string) => setScope(current =>
    current.includes(value) ? current.filter(item => item !== value) : [...current, value],
  );

  return (
    <Card data-testid="panel-mechanic-access">
      <CardHeader>
        <CardTitle>Autorizaciones de Técnicos Mecánicos</CardTitle>
        <CardDescription>Autoriza técnicos externos para operar únicamente los módulos y fechas indicados.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="mechanic-search">Cédula del técnico</label>
            <Input id="mechanic-search" value={search} onChange={event => { setSearch(event.target.value); setSelectedMechanic(null); }}
              placeholder="Ej.: 1.234.567.890" data-testid="input-mechanic-search" />
            {trimmedSearch.length >= 1 && !selectedMechanic && (
              <div className="rounded-md border divide-y" data-testid="mechanic-search-results">
                {searching ? <p className="p-3 text-sm text-muted-foreground">Buscando…</p> : results.length === 0 ? <p className="p-3 text-sm text-muted-foreground">No se encontraron técnicos.</p> :
                  results.map(mechanic => <button type="button" key={mechanic.id} className="block w-full p-3 text-left text-sm hover:bg-muted"
                    onClick={() => setSelectedMechanic(mechanic)} data-testid={`button-select-mechanic-${mechanic.id}`}>
                    <span className="font-medium">{mechanic.fullName || "Técnico mecánico"}</span>
                    <span className="block text-xs text-muted-foreground">{mechanic.employerCompanyName || "Sin empresa"}</span>
                  </button>)}
              </div>
            )}
            {selectedMechanic && <div className="rounded-md bg-muted p-3 text-sm" data-testid="selected-mechanic">
              <span className="font-medium">{selectedMechanic.fullName || "Técnico mecánico"}</span>
              <Button type="button" variant="ghost" size="sm" className="ml-2" onClick={() => setSelectedMechanic(null)} data-testid="button-clear-mechanic">Cambiar</Button>
            </div>}
          </div>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-sm font-medium" htmlFor="mechanic-start-date">Inicio</label><Input id="mechanic-start-date" type="date" value={startDate} onChange={event => setStartDate(event.target.value)} required data-testid="input-mechanic-start-date" /></div>
              <div><label className="text-sm font-medium" htmlFor="mechanic-end-date">Finalización (opcional)</label><Input id="mechanic-end-date" type="date" min={startDate} value={endDate} onChange={event => setEndDate(event.target.value)} data-testid="input-mechanic-end-date" /></div>
            </div>
            <fieldset><legend className="text-sm font-medium mb-2">Alcance operativo</legend>
              <div className="flex flex-wrap gap-3">{MECHANIC_SCOPES.map(item => <label key={item.value} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={scope.includes(item.value)} onChange={() => toggleScope(item.value)} data-testid={`checkbox-mechanic-scope-${item.value}`} />{item.label}</label>)}</div>
            </fieldset>
            <Button type="button" onClick={() => createGrant.mutate()} disabled={createGrant.isPending || !selectedMechanic} data-testid="button-create-mechanic-access">
               Enviar invitación
            </Button>
          </div>
        </div>
        <div>
          <h3 className="mb-2 text-sm font-semibold">Autorizaciones actuales e históricas</h3>
          <Table data-testid="table-mechanic-access"><TableHeader><TableRow><TableHead>Técnico</TableHead><TableHead>Empresa empleadora</TableHead><TableHead>Empresa autorizada</TableHead><TableHead>Vigencia</TableHead><TableHead>Alcance</TableHead><TableHead>Estado</TableHead><TableHead /></TableRow></TableHeader>
            <TableBody>{grants.length === 0 ? <TableRow><TableCell colSpan={7} className="text-muted-foreground">No hay autorizaciones registradas.</TableCell></TableRow> : grants.map(grant => {
              const today = new Date().toISOString().slice(0, 10);
               const status = ({ pending: "Pendiente", accepted: "Aceptada", rejected: "Rechazada", revoked: "Revocada", expired: "Vencida" } as Record<string, string>)[grant.status] || "Pendiente";
              return <TableRow key={grant.id} data-testid={`row-mechanic-access-${grant.id}`}><TableCell>{grant.mechanicName || grant.mechanicUsername}<span className="block text-xs text-muted-foreground">{grant.mechanicEmail}</span></TableCell><TableCell>{grant.employerCompanyName}</TableCell><TableCell data-testid={`authorized-company-mechanic-access-${grant.id}`}>{grant.authorizedCompanyName || grant.authorizedCompanyId}</TableCell><TableCell>{grant.startDate} {grant.endDate ? `— ${grant.endDate}` : "— sin vencimiento"}</TableCell><TableCell>{grant.scope.map(value => MECHANIC_SCOPES.find(item => item.value === value)?.label || value).join(", ")}</TableCell><TableCell><Badge variant={grant.status === "accepted" ? "default" : "secondary"} data-testid={`status-mechanic-access-${grant.id}`}>{status}</Badge></TableCell><TableCell>{(grant.status === "pending" || grant.status === "accepted") && <Button size="sm" variant="destructive" onClick={() => revokeGrant.mutate(grant.id)} disabled={revokeGrant.isPending} data-testid={`button-revoke-mechanic-access-${grant.id}`}>Revocar</Button>}</TableCell></TableRow>;
            })}</TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

interface ExtraSeatPurchaseInfo {
  role: string;
  roleName: string;
  pricePerSeatCop: number;
  currentCount: number;
  limit: number;
  extraSeats: number;
}

export default function GestionUsuarios() {
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const [, navigate] = useLocation();
  const [open, setOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserWithoutPassword | null>(null);
  const [showExtraSeatModal, setShowExtraSeatModal] = useState(false);
  const [extraSeatPurchaseInfo, setExtraSeatPurchaseInfo] = useState<ExtraSeatPurchaseInfo | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVaultCompanyId, setSelectedVaultCompanyId] = useState<string | null>(null);
  
  const { data: users, isLoading } = useQuery<UserWithoutPassword[]>({
    queryKey: ["/api/users"],
  });

  // Query para obtener las empresas disponibles
  const { data: companies } = useQuery<Company[]>({
    queryKey: ["/api/companies"],
    enabled: currentUser?.role !== "tecnico_mecanico",
  });

  const { data: workers = [], isLoading: workersLoading } = useQuery<Worker[]>({
    queryKey: ["/api/workers"],
    enabled: open,
  });

  const hasGlobalCompanyAccess = currentUser?.role ? hasGlobalAccess(currentUser.role) : false;
  const canManageMechanicAccess = (currentUser?.role === "superusuario" || currentUser?.role === "admin") &&
    getRolePermissions(currentUser.role).includes("mechanic_access:manage");

  const companyMap = useMemo(() => {
    const map: Record<string, string> = {};
    (companies || []).forEach((c) => { map[c.id] = c.name; });
    return map;
  }, [companies]);

  const companyVaults = useMemo(() => {
    if (!hasGlobalCompanyAccess || !users || users.length === 0) return [];
    const grouped: Record<string, { companyId: string; companyName: string; total: number; roles: Record<string, number> }> = {};
    const noCompany = { companyId: "__no_company__", companyName: "Sin empresa asignada", total: 0, roles: {} as Record<string, number> };
    users.forEach((u) => {
      const key = u.companyId || "__no_company__";
      if (key === "__no_company__") {
        noCompany.total++;
        const roleName = roleLabels[u.role] || u.role;
        noCompany.roles[roleName] = (noCompany.roles[roleName] || 0) + 1;
      } else {
        if (!grouped[key]) {
          grouped[key] = {
            companyId: key,
            companyName: companyMap[key] || "Empresa desconocida",
            total: 0,
            roles: {},
          };
        }
        grouped[key].total++;
        const roleName = roleLabels[u.role] || u.role;
        grouped[key].roles[roleName] = (grouped[key].roles[roleName] || 0) + 1;
      }
    });
    const result = Object.values(grouped).sort((a, b) => b.total - a.total);
    if (noCompany.total > 0) result.push(noCompany);
    return result;
  }, [users, companyMap, hasGlobalCompanyAccess]);

  const selectedVaultCompanyName = selectedVaultCompanyId === "__no_company__"
    ? "Sin empresa asignada"
    : selectedVaultCompanyId ? (companyMap[selectedVaultCompanyId] || "Empresa") : "";
  
  // Roles que solo deben ser visibles para usuarios con acceso global (proveedor)
  const providerOnlyRoles = ['superadmin', 'admin', 'soporte'];
  
  // Roles que no se gestionan desde esta pantalla (ej: LSO va a Directorio de Profesionales)
  const hiddenFromRoleList: string[] = []; // LSO ahora visible
  
  // Filtrar los roles visibles según el usuario actual
  const visibleRoleLabels = useMemo(() => {
    const filtered: Record<string, string> = {};
    for (const [role, label] of Object.entries(roleLabels)) {
      // Siempre ocultar roles que no se gestionan desde aquí
      if (hiddenFromRoleList.includes(role)) {
        continue;
      }
      // Si no tiene acceso global, ocultar roles del proveedor
      if (!currentUser || !hasGlobalAccess(currentUser.role)) {
        if (providerOnlyRoles.includes(role)) {
          continue;
        }
      }
      filtered[role] = label;
    }
    return filtered;
  }, [currentUser?.role]);


  const form = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      username: "",
      password: "",
      role: "vigia_sst",
      fullName: "",
      email: "",
      identificationNumber: "",
      department: "",
      companyId: null,
      workerId: null,
      sstProfessionType: null,
      sstLicenseNumber: null,
      sstLicenseIssuer: null,
      sstLicenseIssuedAt: null,
      sstLicenseExpiresAt: null,
      sstLicenseStatus: null,
    },
  });

  // Watch the role to conditionally show SST credentials section
  const selectedRole = form.watch("role");
  const isGeneralManager = selectedRole === "admin";
  const selectedWorkerId = form.watch("workerId");
  const selectedCompanyId = form.watch("companyId");
  const selectedCompany = useMemo(() => {
    const companyId = selectedCompanyId || currentUser?.companyId;
    return (companies || []).find((company) => company.id === companyId) || null;
  }, [companies, currentUser?.companyId, selectedCompanyId]);
  const hasManagerCompanyData = Boolean(
    selectedCompany?.legalRepName?.trim() && selectedCompany?.legalRepId?.trim(),
  );
  const showCredentialFields = !isGeneralManager || !!editingUser;
  const selectedWorker = useMemo(
    () => workers.find((worker) => worker.id === selectedWorkerId) || null,
    [workers, selectedWorkerId],
  );
  const availableWorkers = useMemo(
    () => workers
      .filter((worker) => worker.status === "activo")
      .filter((worker) => !selectedCompanyId || worker.companyId === selectedCompanyId)
      .sort((a, b) => a.name.localeCompare(b.name, "es")),
    [workers, selectedCompanyId],
  );

  useEffect(() => {
    if (!open || editingUser || !isGeneralManager || !selectedCompany) return;

    const legalRepName = selectedCompany.legalRepName?.trim();
    const legalRepId = selectedCompany.legalRepId?.replace(/[\s.-]/g, "").trim();
    if (!legalRepName || !legalRepId) return;

    form.setValue("fullName", legalRepName, { shouldDirty: true, shouldValidate: true });
    form.setValue("identificationNumber", legalRepId, { shouldDirty: true, shouldValidate: true });
    form.setValue("department", selectedCompany.legalRepPosition?.trim() || "Dirección General", { shouldDirty: true });
    form.setValue("username", buildWorkerUsername(legalRepName, users || []), { shouldDirty: true, shouldValidate: true });
    form.setValue("password", `${legalRepId}21`, { shouldDirty: true, shouldValidate: true });
  }, [editingUser, form, isGeneralManager, open, selectedCompany, users]);

  const createMutation = useMutation({
    mutationFn: async (data: UserFormData) => {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include"
      });
      if (!res.ok) {
        const text = await res.text();
        let errorData: any = null;
        let errorMessage = "Error al crear usuario";
        try {
          errorData = JSON.parse(text);
          errorMessage = errorData?.message || errorData?.error || errorMessage;
        } catch {
          errorMessage = text || errorMessage;
        }
        const error: any = new Error(errorMessage);
        error.data = errorData;
        throw error;
      }
      return res.json();
    },
    onSuccess: (data: UserWithoutPassword & {
      emailSent?: boolean;
      partialSuccess?: boolean;
      emailSkippedReason?: string;
    }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      const emailStatus = data.emailSent
        ? " Las credenciales fueron enviadas al correo registrado."
        : data.emailSkippedReason
          ? ` ${data.emailSkippedReason}`
        : data.partialSuccess
          ? " El usuario fue creado, pero no se pudo enviar el correo de credenciales."
          : "";
      toast({
        title: data.emailSent ? "Usuario creado y correo enviado" : "Usuario creado",
        description: `El usuario ha sido creado exitosamente.${emailStatus}`,
        className: data.emailSent
          ? "bg-green-50 border-green-200"
          : "bg-yellow-50 border-yellow-200",
      });
      setOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      // Obtener datos del error (adjuntados en mutationFn)
      const errorData = error.data || null;
      
      // Detectar si es error de límite con opción de compra
      if (errorData?.canPurchase && errorData?.role && errorData?.pricePerSeatCop) {
        setExtraSeatPurchaseInfo({
          role: errorData.role,
          roleName: errorData.roleName || errorData.role,
          pricePerSeatCop: errorData.pricePerSeatCop,
          currentCount: errorData.currentCount || 0,
          limit: errorData.limit || 1,
          extraSeats: errorData.extraSeats || 0
        });
        setShowExtraSeatModal(true);
        setOpen(false);
        return;
      }
      
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<UserFormData> }) => {
      return await apiRequest("PATCH", `/api/users/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Usuario actualizado",
        description: "El usuario ha sido actualizado exitosamente",
        className: "bg-yellow-50 border-yellow-200",
      });
      setOpen(false);
      setEditingUser(null);
      form.reset();
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
      return await apiRequest("DELETE", `/api/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Usuario eliminado",
        description: "El usuario ha sido eliminado exitosamente",
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

  const handleSubmit = (data: UserFormData) => {
    // Para usuarios no-superadmin, forzar el companyId al del usuario actual
    const finalData = { ...data };
    if (finalData.role === "tecnico_mecanico") {
      const linkedWorker = finalData.workerId
        ? workers.find((worker) => worker.id === finalData.workerId)
        : null;
      if (linkedWorker?.identificationNumber) {
        finalData.identificationNumber = linkedWorker.identificationNumber;
      } else if (!editingUser || !finalData.identificationNumber?.trim()) {
        toast({
          title: "Trabajador requerido",
          description: "Seleccione un trabajador vinculado para crear un Técnico Mecánico.",
          variant: "destructive",
        });
        return;
      }
    }
    if (currentUser?.role !== 'superadmin' && currentUser?.companyId) {
      finalData.companyId = currentUser.companyId;
    }

    if (!editingUser && finalData.role === "admin" && !hasManagerCompanyData) {
      toast({
        title: "Datos del representante legal incompletos",
        description: "Registre primero el nombre y la cédula del representante legal en la configuración de la empresa.",
        variant: "destructive",
      });
      return;
    }
    
    if (editingUser) {
      // When editing, don't send password if it's empty
      if (!finalData.password) {
        delete finalData.password;
      }
      updateMutation.mutate({ id: editingUser.id, data: finalData });
    } else {
      // Para Gerente General la contraseña se genera desde los datos de la empresa.
      if (!finalData.password) {
        toast({
          title: "Error",
          description: "La contraseña es requerida para crear un usuario",
          variant: "destructive",
        });
        return;
      }
      createMutation.mutate(finalData);
    }
  };

  const handleWorkerSelection = (workerId: string) => {
    const worker = workers.find((candidate) => candidate.id === workerId);
    if (!worker) {
      form.setValue("workerId", null, { shouldDirty: true });
      return;
    }

    form.setValue("workerId", worker.id, { shouldDirty: true, shouldValidate: true });
    form.setValue("fullName", worker.name, { shouldDirty: true, shouldValidate: true });
    form.setValue("email", worker.email || "", { shouldDirty: true });
    form.setValue("department", worker.department || "", { shouldDirty: true });
    form.setValue("password", `${worker.identificationNumber}21`, { shouldDirty: true });
    form.setValue("username", buildWorkerUsername(worker.name, users || []), { shouldDirty: true });
    if (hasGlobalCompanyAccess) {
      form.setValue("companyId", worker.companyId, { shouldDirty: true });
    }
  };

  const handleEdit = (user: UserWithoutPassword) => {
    setEditingUser(user);
    form.reset({
      username: user.username,
      password: "",
      role: user.role,
      fullName: user.fullName || "",
      email: user.email || "",
      identificationNumber: user.identificationNumber || "",
      department: user.department || "",
      companyId: user.companyId,
      workerId: user.workerId,
      sstProfessionType: user.sstProfessionType || null,
      sstLicenseNumber: user.sstLicenseNumber || null,
      sstLicenseIssuer: user.sstLicenseIssuer || null,
      sstLicenseIssuedAt: user.sstLicenseIssuedAt || null,
      sstLicenseExpiresAt: user.sstLicenseExpiresAt || null,
      sstLicenseStatus: user.sstLicenseStatus || null,
    });
    setOpen(true);
  };

  const handleNew = () => {
    setEditingUser(null);
    // Para usuarios no-superadmin, auto-asignar su propia empresa
    const defaultCompanyId = currentUser && hasGlobalAccess(currentUser.role) ? null : currentUser?.companyId || null;
    form.reset({
      username: "",
      password: "",
      role: "vigia_sst",
      fullName: "",
      email: "",
      identificationNumber: "",
      department: "",
      companyId: defaultCompanyId,
      workerId: null,
      sstProfessionType: null,
      sstLicenseNumber: null,
      sstLicenseIssuer: null,
      sstLicenseIssuedAt: null,
      sstLicenseExpiresAt: null,
      sstLicenseStatus: null,
    });
    setOpen(true);
  };

  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case "admin":
        return "default";
      case "coordinador_sst":
        return "secondary";
      case "coordinador_rrhh":
        return "secondary";
      case "jefe_personal":
        return "outline";
      case "supervisor":
        return "outline";
      case "trabajador":
        return "outline";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">
            Gestión de Usuarios
          </h1>
          <p className="text-muted-foreground">
            Administra los usuarios y sus roles en el sistema
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleNew} data-testid="button-new-user">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Usuario
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingUser ? "Editar Usuario" : "Crear Nuevo Usuario"}
              </DialogTitle>
              <DialogDescription>
                {editingUser
                  ? "Modifica los datos del usuario y asigna su rol"
                  : "Completa los datos para crear un nuevo usuario"}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                {!isGeneralManager && (
                  <FormField
                    control={form.control}
                    name="workerId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Trabajador / Nombre Completo</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            if (value === NO_WORKER_VALUE) {
                              field.onChange(null);
                              if (!editingUser) {
                                form.setValue("username", "", { shouldDirty: true });
                                form.setValue("fullName", "", { shouldDirty: true });
                                form.setValue("email", "", { shouldDirty: true });
                                form.setValue("department", "", { shouldDirty: true });
                              }
                              form.setValue("password", "", { shouldDirty: true });
                              return;
                            }
                            handleWorkerSelection(value);
                          }}
                          value={field.value || NO_WORKER_VALUE}
                        >
                          <FormControl>
                            <SelectTrigger data-testid="select-user-worker">
                              <SelectValue placeholder={workersLoading ? "Cargando trabajadores..." : "Seleccionar trabajador"} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={NO_WORKER_VALUE}>
                              <span className="text-muted-foreground">Sin trabajador vinculado</span>
                            </SelectItem>
                            {availableWorkers.map((worker) => (
                              <SelectItem key={worker.id} value={worker.id}>
                                {worker.name} — {worker.identificationNumber}
                              </SelectItem>
                            ))}
                            {editingUser && field.value && !availableWorkers.some((worker) => worker.id === field.value) && (
                              <SelectItem value={field.value}>
                                {selectedWorker?.name || form.getValues("fullName")} — trabajador actual
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Al seleccionar un trabajador se completan el usuario, email, área y contraseña.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {showCredentialFields && (
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre de Usuario</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            disabled={!!selectedWorkerId || !!editingUser}
                            autoComplete="off"
                            placeholder={selectedWorkerId ? "Generado automáticamente" : undefined}
                            data-testid="input-username"
                          />
                        </FormControl>
                        <FormDescription>
                          Se genera automáticamente al seleccionar el trabajador.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Contraseña {editingUser && "(dejar vacío para no cambiar)"}
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="password"
                            disabled={!!selectedWorkerId && !editingUser}
                            autoComplete="new-password"
                            placeholder={
                              selectedWorkerId
                                ? "Generada automáticamente: cédula + 21"
                                : undefined
                            }
                            data-testid="input-password"
                          />
                        </FormControl>
                        <FormDescription>
                          Se genera con la cédula del trabajador más el sufijo 21.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                )}

                {!isGeneralManager && !selectedWorkerId && (
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre Completo</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} data-testid="input-fullname" />
                        </FormControl>
                        <FormDescription>
                          Úselo únicamente para usuarios que no estén vinculados a un trabajador.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* Empresa (solo visible para superadmin - otros usuarios usan su propia empresa) */}
                {currentUser && hasGlobalAccess(currentUser.role) ? (
                  <FormField
                    control={form.control}
                    name="companyId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Empresa</FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(value === "none" ? null : value)}
                          value={field.value || "none"}
                        >
                          <FormControl>
                            <SelectTrigger data-testid="select-company">
                              <SelectValue placeholder="Seleccionar empresa" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">
                              <span className="text-muted-foreground">Sin asignar</span>
                            </SelectItem>
                            {companies?.map((company) => (
                              <SelectItem key={company.id} value={company.id}>
                                <div className="flex items-center gap-2">
                                  <Building2 className="h-4 w-4" />
                                  <span>{company.name}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Empresa a la que pertenece el usuario
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : (
                  <input type="hidden" {...form.register("companyId")} />
                )}

                <div className={isGeneralManager ? "" : "grid grid-cols-2 gap-4"}>
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="email"
                            value={field.value || ""}
                            placeholder="usuario@empresa.com"
                            data-testid="input-email"
                          />
                        </FormControl>
                        <FormDescription>
                          {isGeneralManager
                            ? "Se utilizará para enviar las credenciales generadas automáticamente."
                            : null}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {!isGeneralManager && (
                    <FormField
                      control={form.control}
                      name="department"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Área / Departamento</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value || ""}
                          >
                            <FormControl>
                              <SelectTrigger data-testid="select-department">
                                <SelectValue placeholder="Seleccionar área" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {AREAS_EMPRESA.map((area) => (
                                <SelectItem key={area} value={area}>
                                  {area}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>

                {isGeneralManager && !editingUser && (
                  <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
                    <p className="text-sm font-medium">Datos del representante legal</p>
                    {selectedCompany ? (
                      <>
                        <p className="text-sm text-muted-foreground">
                          Estos datos se toman de la configuración de la empresa y se utilizarán para crear la cuenta.
                        </p>
                        <p className="text-sm text-muted-foreground">
                          El nombre de usuario y la contraseña se generan automáticamente; en este formulario solo debe indicar el correo.
                        </p>
                        <div className="grid gap-3 md:grid-cols-3">
                          <div>
                            <p className="text-xs text-muted-foreground">Nombre</p>
                            <p className="text-sm font-medium">{selectedCompany.legalRepName || "No registrado"}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Cédula</p>
                            <p className="text-sm font-medium">{selectedCompany.legalRepId || "No registrada"}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Cargo</p>
                            <p className="text-sm font-medium">{selectedCompany.legalRepPosition || "No registrado"}</p>
                          </div>
                        </div>
                        {!hasManagerCompanyData && (
                          <p className="text-sm text-destructive">
                            Complete nombre y cédula del representante legal en la configuración de la empresa antes de crear este usuario.
                          </p>
                        )}
                      </>
                    ) : (
                      <p className="text-sm text-destructive">
                        Seleccione una empresa para cargar los datos del representante legal.
                      </p>
                    )}
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rol</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-role">
                            <SelectValue placeholder="Seleccionar rol" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {/* Roles de administración de nivel empresa */}
                          {editingUser && field.value === "superusuario" && (
                            <SelectItem value="superusuario">
                              {roleLabels.superusuario} (provisionado al crear la empresa)
                            </SelectItem>
                          )}
                          <SelectItem value="admin">
                            <div className="flex items-center gap-2">
                              <Shield className="h-4 w-4" />
                              <span>{roleLabels.admin}</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="alta_direccion">
                            {roleLabels.alta_direccion}
                          </SelectItem>
                          
                          {/* Roles SST especializados */}
                          <SelectItem value="responsable_sst">
                            {roleLabels.responsable_sst}
                          </SelectItem>
                          <SelectItem value="coordinador_salud">
                            {roleLabels.coordinador_salud}
                          </SelectItem>
                          <SelectItem value="lso">
                            {roleLabels.lso}
                          </SelectItem>
                          <SelectItem value="coordinador_sst">
                            {roleLabels.coordinador_sst}
                          </SelectItem>
                          
                          {/* Roles de recursos humanos y supervisión */}
                          <SelectItem value="coordinador_rrhh">
                            {roleLabels.coordinador_rrhh}
                          </SelectItem>
                          <SelectItem value="jefe_personal">
                            {roleLabels.jefe_personal}
                          </SelectItem>
                          <SelectItem value="supervisor">
                            {roleLabels.supervisor}
                          </SelectItem>
                          <SelectItem value="vigia_sst">
                            {roleLabels.vigia_sst}
                          </SelectItem>

                          {/* Rol PESV */}
                          <SelectItem value="tecnico_mecanico">
                            {roleLabels.tecnico_mecanico}
                          </SelectItem>

                          {editingUser && field.value === "trabajador" && (
                            <SelectItem value="trabajador">
                              {roleLabels.trabajador} (gestionado desde contrato)
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        {field.value && roleDescriptions[field.value as UserRole]}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Sección de Credenciales SST - Solo visible para roles SST */}
                {selectedRole && SST_ROLES.includes(selectedRole as typeof SST_ROLES[number]) && (
                  <div className="space-y-4 rounded-lg border p-4 bg-muted/30" data-testid="section-sst-credentials">
                    <div className="flex items-center gap-2 text-sm font-medium text-primary">
                      <Award className="h-4 w-4" />
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
                              <SelectTrigger data-testid="select-sst-profession-type">
                                <SelectValue placeholder="Seleccionar tipo de profesión" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="none">
                                <span className="text-muted-foreground">Sin especificar</span>
                              </SelectItem>
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
                            <FormLabel>Número de Licencia SST</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                value={field.value || ""}
                                placeholder="Ej: 1234567890"
                                data-testid="input-sst-license-number"
                              />
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
                            <FormLabel>Entidad que Expide</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                value={field.value || ""}
                                placeholder="Ej: Secretaría de Salud de Bogotá"
                                data-testid="input-sst-license-issuer"
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
                        name="sstLicenseIssuedAt"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fecha de Expedición</FormLabel>
                            <FormControl>
                              <Input
                                type="date"
                                {...field}
                                value={field.value || ""}
                                data-testid="input-sst-license-issued-at"
                              />
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
                              <Input
                                type="date"
                                {...field}
                                value={field.value || ""}
                                data-testid="input-sst-license-expires-at"
                              />
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
                          <FormLabel>Estado de Licencia</FormLabel>
                          <Select
                            onValueChange={(value) => field.onChange(value === "none" ? null : value)}
                            value={field.value || "none"}
                          >
                            <FormControl>
                              <SelectTrigger data-testid="select-sst-license-status">
                                <SelectValue placeholder="Seleccionar estado" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="none">
                                <span className="text-muted-foreground">Sin especificar</span>
                              </SelectItem>
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
                  </div>
                )}

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpen(false)}
                    data-testid="button-cancel"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                    data-testid="button-submit"
                  >
                    {editingUser ? "Actualizar" : "Crear"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información de Roles</CardTitle>
          <CardDescription>
            Cada rol tiene permisos específicos en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(visibleRoleLabels).map(([role, label]) => {
              const usersWithThisRole = users?.filter(u => u.role === role).length || 0;
              const isUnlimited = role === 'trabajador' || role === 'worker';
              const isGlobalRole = ['superadmin', 'admin', 'soporte'].includes(role);
              const hasRoleLimit = [
                'superusuario', 'responsable_sst', 'coordinador_sst',
                'coordinador_rrhh', 'coordinador_salud', 'jefe_personal',
                'supervisor', 'vigia_sst', 'auditor_interno', 'lso', 'tecnico_mecanico'
              ].includes(role);
              const limitPerRole = 1;
              
              return (
                <div key={role} className="flex items-start gap-3 p-3 rounded-md border">
                  <Shield className="h-5 w-5 mt-0.5 text-primary" />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-medium">{label}</div>
                      {isUnlimited ? (
                        <Badge variant="secondary" className="text-xs">
                          <span className="text-green-600 dark:text-green-400">Ilimitado</span>
                        </Badge>
                      ) : isGlobalRole ? (
                        <Tooltip>
                          <TooltipTrigger>
                            <Badge variant="outline" className="text-xs">
                              <span className="text-amber-600 dark:text-amber-400">Solo proveedor</span>
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Rol reservado para personal del proveedor SST Colombia</p>
                          </TooltipContent>
                        </Tooltip>
                      ) : hasRoleLimit ? (
                        <Badge 
                          variant={usersWithThisRole >= limitPerRole ? "destructive" : "outline"}
                          className="text-xs"
                        >
                          {usersWithThisRole}/{limitPerRole}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">
                          Sin límite
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {roleDescriptions[role as UserRole]}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {canManageMechanicAccess && <MechanicAccessPanel />}

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>Usuarios del Sistema</CardTitle>
            <CardDescription>
              {users?.length || 0} usuarios registrados
            </CardDescription>
          </div>
          {(!hasGlobalCompanyAccess || selectedVaultCompanyId) && (
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar usuario, nombre, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-9"
                data-testid="input-search-users"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  data-testid="button-clear-search-users"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          )}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Cargando usuarios...
            </div>
          ) : !users || users.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hay usuarios registrados
            </div>
          ) : hasGlobalCompanyAccess && !selectedVaultCompanyId ? (
            <>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar empresa por nombre..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  data-testid="input-search-user-vaults"
                />
              </div>
              {companyVaults.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No se encontraron empresas con usuarios
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {companyVaults
                    .filter(v => !searchTerm || v.companyName.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map((vault) => (
                    <Card
                      key={vault.companyId}
                      className="hover-elevate cursor-pointer transition-colors"
                      onClick={() => {
                        setSelectedVaultCompanyId(vault.companyId);
                        setSearchTerm("");
                      }}
                      data-testid={`vault-company-${vault.companyId}`}
                    >
                      <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <Building2 className="h-5 w-5 text-muted-foreground shrink-0" />
                          <CardTitle className="text-base truncate" data-testid={`vault-name-${vault.companyId}`}>{vault.companyName}</CardTitle>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium" data-testid={`vault-total-${vault.companyId}`}>{vault.total} usuario{vault.total !== 1 ? "s" : ""}</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(vault.roles).slice(0, 4).map(([roleName, count]) => (
                            <Badge key={roleName} variant="secondary">
                              {count} {roleName}
                            </Badge>
                          ))}
                          {Object.keys(vault.roles).length > 4 && (
                            <Badge variant="outline">+{Object.keys(vault.roles).length - 4} más</Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          ) : (() => {
            const vaultFilteredUsers = hasGlobalCompanyAccess && selectedVaultCompanyId
              ? users.filter(u => {
                  if (selectedVaultCompanyId === "__no_company__") return !u.companyId;
                  return u.companyId === selectedVaultCompanyId;
                })
              : users;
            const normalizedSearch = searchTerm.toLowerCase().trim();
            const filteredUsers = normalizedSearch
              ? vaultFilteredUsers.filter((u) => {
                  const roleName = roleLabels[u.role] || u.role;
                  return (
                    u.username.toLowerCase().includes(normalizedSearch) ||
                    (u.fullName || "").toLowerCase().includes(normalizedSearch) ||
                    (u.email || "").toLowerCase().includes(normalizedSearch) ||
                    (u.department || "").toLowerCase().includes(normalizedSearch) ||
                    roleName.toLowerCase().includes(normalizedSearch)
                  );
                })
              : vaultFilteredUsers;
            return (
              <>
                {hasGlobalCompanyAccess && selectedVaultCompanyId && (
                  <div className="flex items-center gap-3 mb-4">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setSelectedVaultCompanyId(null);
                        setSearchTerm("");
                      }}
                      data-testid="button-back-to-user-vaults"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Volver a empresas
                    </Button>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-muted-foreground" />
                      <span className="text-lg font-semibold" data-testid="text-vault-company-name">{selectedVaultCompanyName}</span>
                      <Badge variant="secondary" data-testid="text-vault-user-count">
                        {filteredUsers.length} usuario{filteredUsers.length !== 1 ? "s" : ""}
                      </Badge>
                    </div>
                  </div>
                )}
                {filteredUsers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No se encontraron usuarios{searchTerm ? ` para "${searchTerm}"` : ""}</p>
                  </div>
                ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Nombre Completo</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Departamento</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id} data-testid={`row-user-${user.id}`}>
                    <TableCell className="font-medium">{user.username}</TableCell>
                    <TableCell>{user.fullName || "-"}</TableCell>
                    <TableCell>{user.email || "-"}</TableCell>
                    <TableCell>{user.department || "-"}</TableCell>
                    <TableCell>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="inline-block cursor-help">
                            <Badge variant={getRoleBadgeVariant(user.role)}>
                              {roleLabels[user.role]}
                            </Badge>
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">{roleDescriptions[user.role]}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(user)}
                          data-testid={`button-edit-${user.id}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              data-testid={`button-delete-${user.id}`}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción no se puede deshacer. Se eliminará permanentemente
                                el usuario <strong>{user.username}</strong>.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel data-testid="button-cancel-delete">
                                Cancelar
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteMutation.mutate(user.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                data-testid="button-confirm-delete"
                              >
                                Eliminar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
                )}
              </>
            );
          })()}
        </CardContent>
      </Card>

      {/* Modal para compra de asiento adicional */}
      <Dialog open={showExtraSeatModal} onOpenChange={setShowExtraSeatModal}>
        <DialogContent className="sm:max-w-md" data-testid="modal-extra-seat">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-600" />
              Límite de Usuario Alcanzado
            </DialogTitle>
            <DialogDescription>
              Tu plan incluye 1 usuario "{extraSeatPurchaseInfo?.roleName}" sin costo adicional.
              {extraSeatPurchaseInfo && extraSeatPurchaseInfo.extraSeats > 0 && (
                <span className="block mt-1">
                  Ya has comprado {extraSeatPurchaseInfo.extraSeats} asiento(s) adicional(es).
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="bg-muted rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Rol:</span>
                <Badge>{extraSeatPurchaseInfo?.roleName}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Usuarios actuales:</span>
                <span className="font-medium">{extraSeatPurchaseInfo?.currentCount}/{extraSeatPurchaseInfo?.limit}</span>
              </div>
              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Costo por usuario adicional:</span>
                  <span className="text-lg font-bold text-primary">
                    ${extraSeatPurchaseInfo?.pricePerSeatCop?.toLocaleString('es-CO')}/mes
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Aprox. $2.50 USD/mes
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowExtraSeatModal(false)}
              data-testid="button-cancel-purchase"
            >
              Cancelar
            </Button>
            <Button
              onClick={() => {
                if (!extraSeatPurchaseInfo || !currentUser?.companyId) return;
                setShowExtraSeatModal(false);
                navigate(`/pago-pse?purchaseType=extra_seat&role=${encodeURIComponent(extraSeatPurchaseInfo.role)}`);
              }}
              data-testid="button-go-to-checkout"
            >
              Ir a Pagar por PSE
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
