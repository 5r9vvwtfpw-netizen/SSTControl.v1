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
import { insertUserSchema, type User, type UserRole } from "@shared/schema";
import { roleLabels, roleDescriptions } from "@shared/permissions";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Plus, Pencil, Trash2, Shield, Info, Building2, Award } from "lucide-react";
import { z } from "zod";
import type { Company } from "@shared/schema";

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
const SST_ROLES = ["coordinador_sst", "lso", "coordinador_salud", "responsable_sst", "admin"] as const;

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

export default function GestionUsuarios() {
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const [open, setOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserWithoutPassword | null>(null);
  
  const { data: users, isLoading } = useQuery<UserWithoutPassword[]>({
    queryKey: ["/api/users"],
  });

  // Query para obtener las empresas disponibles
  const { data: companies } = useQuery<Company[]>({
    queryKey: ["/api/companies"],
  });
  
  // Filtrar los roles visibles - ocultar superadmin para usuarios que no son superadmin
  const visibleRoleLabels = useMemo(() => {
    if (currentUser?.role === 'superadmin') {
      return roleLabels;
    }
    // Filtrar el rol superadmin para usuarios no-superadmin
    const filtered: Record<string, string> = {};
    for (const [role, label] of Object.entries(roleLabels)) {
      if (role !== 'superadmin') {
        filtered[role] = label;
      }
    }
    return filtered;
  }, [currentUser?.role]);


  const form = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      username: "",
      password: "",
      role: "trabajador",
      fullName: "",
      email: "",
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

  const createMutation = useMutation({
    mutationFn: async (data: UserFormData) => {
      return await apiRequest("POST", "/api/users", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Usuario creado",
        description: "El usuario ha sido creado exitosamente",
        className: "bg-yellow-50 border-yellow-200",
      });
      setOpen(false);
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
    if (currentUser?.role !== 'superadmin' && currentUser?.companyId) {
      finalData.companyId = currentUser.companyId;
    }
    
    if (editingUser) {
      // When editing, don't send password if it's empty
      if (!finalData.password) {
        delete finalData.password;
      }
      updateMutation.mutate({ id: editingUser.id, data: finalData });
    } else {
      // When creating, password is required
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

  const handleEdit = (user: UserWithoutPassword) => {
    setEditingUser(user);
    form.reset({
      username: user.username,
      password: "",
      role: user.role,
      fullName: user.fullName || "",
      email: user.email || "",
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
    const defaultCompanyId = currentUser?.role === 'superadmin' ? null : currentUser?.companyId || null;
    form.reset({
      username: "",
      password: "",
      role: "trabajador",
      fullName: "",
      email: "",
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
                            disabled={!!editingUser}
                            autoComplete="off"
                            data-testid="input-username"
                          />
                        </FormControl>
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
                            autoComplete="new-password"
                            data-testid="input-password"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre Completo</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} data-testid="input-fullname" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Empresa (solo visible para superadmin - otros usuarios usan su propia empresa) */}
                {currentUser?.role === 'superadmin' ? (
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

                <div className="grid grid-cols-2 gap-4">
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />

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
                </div>

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
                          <SelectItem value="superusuario">
                            <div className="flex items-center gap-2">
                              <Shield className="h-4 w-4 text-yellow-600" />
                              <span>{roleLabels.superusuario}</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="admin">
                            <div className="flex items-center gap-2">
                              <Shield className="h-4 w-4" />
                              <span>{roleLabels.admin}</span>
                            </div>
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
                          
                          {/* Rol básico */}
                          <SelectItem value="trabajador">
                            {roleLabels.trabajador}
                          </SelectItem>
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
            {Object.entries(visibleRoleLabels).map(([role, label]) => (
              <div key={role} className="flex items-start gap-3 p-3 rounded-md border">
                <Shield className="h-5 w-5 mt-0.5 text-primary" />
                <div className="flex-1 space-y-1">
                  <div className="font-medium">{label}</div>
                  <p className="text-sm text-muted-foreground">
                    {roleDescriptions[role as UserRole]}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Usuarios del Sistema</CardTitle>
          <CardDescription>
            {users?.length || 0} usuarios registrados
          </CardDescription>
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
                {users.map((user) => (
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
        </CardContent>
      </Card>
    </div>
  );
}
