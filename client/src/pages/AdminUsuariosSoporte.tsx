import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Headset, Plus, Trash2, UserPlus, Shield, Copy, Check, Eye, EyeOff, Tags, Edit2 } from "lucide-react";
import { Redirect } from "wouter";
import type { User } from "@shared/schema";

const TICKET_CATEGORIES = [
  { value: "soporte_tecnico", label: "Soporte Técnico", color: "bg-blue-100 text-blue-700 border-blue-200" },
  { value: "facturacion", label: "Facturación", color: "bg-green-100 text-green-700 border-green-200" },
  { value: "nueva_funcionalidad", label: "Nueva Funcionalidad", color: "bg-purple-100 text-purple-700 border-purple-200" },
  { value: "error_bug", label: "Error/Bug", color: "bg-red-100 text-red-700 border-red-200" },
  { value: "capacitacion", label: "Capacitación", color: "bg-amber-100 text-amber-700 border-amber-200" },
  { value: "consulta_general", label: "Consulta General", color: "bg-gray-100 text-gray-700 border-gray-200" },
];

type SupportUser = Omit<User, "password">;

export default function AdminUsuariosSoporte() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [editingSpecialties, setEditingSpecialties] = useState<string | null>(null);
  const [tempSpecialties, setTempSpecialties] = useState<string[]>([]);
  const [newUserData, setNewUserData] = useState({
    username: "",
    password: "",
    fullName: "",
    email: "",
    supportSpecialties: [] as string[],
  });
  const [createdCredentials, setCreatedCredentials] = useState<{
    username: string;
    password: string;
  } | null>(null);

  const { data: supportUsers = [], isLoading } = useQuery<SupportUser[]>({
    queryKey: ["/api/admin/support-users"],
    enabled: user?.role === "superadmin",
  });

  const createUserMutation = useMutation({
    mutationFn: async (data: typeof newUserData) => {
      const res = await apiRequest("POST", "/api/admin/support-users", data);
      if (!res.ok) {
        const error = await res.text();
        throw new Error(error);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/support-users"] });
      setCreatedCredentials({
        username: newUserData.username,
        password: newUserData.password,
      });
      setNewUserData({ username: "", password: "", fullName: "", email: "", supportSpecialties: [] });
      toast({
        title: "Usuario creado",
        description: "El usuario de soporte ha sido creado exitosamente",
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

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await apiRequest("DELETE", `/api/admin/support-users/${userId}`);
      if (!res.ok) {
        const error = await res.text();
        throw new Error(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/support-users"] });
      setDeleteUserId(null);
      toast({
        title: "Usuario eliminado",
        description: "El usuario de soporte ha sido eliminado",
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

  const updateSpecialtiesMutation = useMutation({
    mutationFn: async ({ userId, specialties }: { userId: string; specialties: string[] }) => {
      const res = await apiRequest("PATCH", `/api/admin/support-users/${userId}/specialties`, {
        supportSpecialties: specialties,
      });
      if (!res.ok) {
        const error = await res.text();
        throw new Error(error);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/support-users"] });
      setEditingSpecialties(null);
      toast({
        title: "Especialidades actualizadas",
        description: "Las categorías del usuario han sido actualizadas",
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

  const generatePassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewUserData({ ...newUserData, password });
  };

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones según el ticket SST-2025-0007
    if (!newUserData.username || !newUserData.password) {
      toast({
        title: "Error",
        description: "Usuario y contraseña son obligatorios",
        variant: "destructive",
      });
      return;
    }

    // Validar usuario: máx 30 caracteres, solo letras y números
    if (newUserData.username.length > 30) {
      toast({
        title: "Error",
        description: "El usuario debe tener máximo 30 caracteres",
        variant: "destructive",
      });
      return;
    }
    if (!/^[a-zA-Z0-9]+$/.test(newUserData.username)) {
      toast({
        title: "Error",
        description: "El usuario solo puede contener letras y números (sin caracteres especiales)",
        variant: "destructive",
      });
      return;
    }

    // Validar contraseña: máx 30 caracteres, no contraseñas comunes
    if (newUserData.password.length > 30) {
      toast({
        title: "Error",
        description: "La contraseña debe tener máximo 30 caracteres",
        variant: "destructive",
      });
      return;
    }
    const commonPasswords = ["123456789", "password", "qwerty", "123123123", "abc123"];
    if (commonPasswords.includes(newUserData.password.toLowerCase())) {
      toast({
        title: "Error",
        description: "Esta contraseña es muy común. Por favor usa una contraseña más segura",
        variant: "destructive",
      });
      return;
    }

    if (!newUserData.email || !newUserData.email.trim()) {
      toast({
        title: "Error",
        description: "El email es obligatorio para crear un usuario de soporte",
        variant: "destructive",
      });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newUserData.email)) {
      toast({
        title: "Error",
        description: "Por favor ingrese un email válido",
        variant: "destructive",
      });
      return;
    }

    // Validar nombre completo si está presente
    if (newUserData.fullName) {
      if (newUserData.fullName.length > 50) {
        toast({
          title: "Error",
          description: "El nombre debe tener máximo 50 caracteres",
          variant: "destructive",
        });
        return;
      }
      if (!/^[A-Z][a-záéíóúñA-Z\s\-]*$/.test(newUserData.fullName)) {
        toast({
          title: "Error",
          description: "El nombre debe empezar con mayúscula, contener solo letras, espacios y guiones",
          variant: "destructive",
        });
        return;
      }
    }

    createUserMutation.mutate(newUserData);
  };

  const closeAndResetDialog = () => {
    setIsCreateDialogOpen(false);
    setCreatedCredentials(null);
    setNewUserData({ username: "", password: "", fullName: "", email: "", supportSpecialties: [] });
    setShowPassword(false);
  };

  const toggleSpecialty = (specialty: string, list: string[], setList: (s: string[]) => void) => {
    if (list.includes(specialty)) {
      setList(list.filter(s => s !== specialty));
    } else {
      setList([...list, specialty]);
    }
  };

  const getCategoryLabel = (value: string) => {
    return TICKET_CATEGORIES.find(c => c.value === value)?.label || value;
  };

  const getCategoryColor = (value: string) => {
    return TICKET_CATEGORIES.find(c => c.value === value)?.color || "bg-gray-100 text-gray-700";
  };

  const startEditingSpecialties = (supportUser: SupportUser) => {
    setEditingSpecialties(supportUser.id);
    setTempSpecialties(supportUser.supportSpecialties || []);
  };

  const saveSpecialties = (userId: string) => {
    updateSpecialtiesMutation.mutate({ userId, specialties: tempSpecialties });
  };

  if (!user || user.role !== "superadmin") {
    return <Redirect to="/" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Headset className="h-6 w-6 text-blue-600" />
            Gestión de Personal de Soporte
          </h1>
          <p className="text-muted-foreground mt-1">
            Crea y administra cuentas para tu equipo de soporte técnico
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
          if (!open) closeAndResetDialog();
          else setIsCreateDialogOpen(true);
        }}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700" data-testid="button-create-support-user">
              <UserPlus className="h-4 w-4 mr-2" />
              Crear Usuario de Soporte
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            {createdCredentials ? (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-green-600">
                    <Check className="h-5 w-5" />
                    Usuario Creado Exitosamente
                  </DialogTitle>
                  <DialogDescription>
                    Comparte estas credenciales con el nuevo miembro del equipo de soporte.
                    <strong className="block mt-2 text-amber-600">
                      ¡Importante! Guarda estas credenciales ahora. La contraseña no se puede recuperar.
                    </strong>
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Usuario</Label>
                    <div className="flex gap-2">
                      <Input value={createdCredentials.username} readOnly className="bg-muted" />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => copyToClipboard(createdCredentials.username, "username")}
                      >
                        {copiedField === "username" ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Contraseña</Label>
                    <div className="flex gap-2">
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={createdCredentials.password}
                        readOnly
                        className="bg-muted"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => copyToClipboard(createdCredentials.password, "password")}
                      >
                        {copiedField === "password" ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md text-sm">
                    <p className="font-medium text-blue-700 dark:text-blue-300">Link de acceso:</p>
                    <code className="text-xs break-all">{window.location.origin}/soporte/login</code>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="ml-2"
                      onClick={() => copyToClipboard(`${window.location.origin}/soporte/login`, "link")}
                    >
                      {copiedField === "link" ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    </Button>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={closeAndResetDialog} data-testid="button-close-credentials">
                    Cerrar
                  </Button>
                </DialogFooter>
              </>
            ) : (
              <>
                <DialogHeader>
                  <DialogTitle>Crear Usuario de Soporte</DialogTitle>
                  <DialogDescription>
                    Crea una cuenta para un nuevo miembro del equipo de soporte. Solo tendrán acceso a
                    gestionar tickets.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateUser} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Usuario *</Label>
                    <Input
                      id="username"
                      placeholder="ej: soporte.maria"
                      value={newUserData.username}
                      onChange={(e) => setNewUserData({ ...newUserData, username: e.target.value })}
                      required
                      data-testid="input-support-username"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Contraseña *</Label>
                    <div className="flex gap-2">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Mínimo 8 caracteres"
                        value={newUserData.password}
                        onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                        required
                        data-testid="input-support-password"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button type="button" variant="outline" onClick={generatePassword}>
                        Generar
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Nombre Completo</Label>
                    <Input
                      id="fullName"
                      placeholder="ej: María García"
                      value={newUserData.fullName}
                      onChange={(e) => setNewUserData({ ...newUserData, fullName: e.target.value })}
                      data-testid="input-support-fullname"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="ej: maria@empresa.com"
                      value={newUserData.email}
                      onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                      required
                      data-testid="input-support-email"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="flex items-center gap-2">
                      <Tags className="h-4 w-4" />
                      Especialidades / Categorías
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Selecciona las categorías de tickets que este usuario puede atender
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {TICKET_CATEGORIES.map((category) => (
                        <div
                          key={category.value}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={`new-${category.value}`}
                            checked={newUserData.supportSpecialties.includes(category.value)}
                            onCheckedChange={() =>
                              toggleSpecialty(
                                category.value,
                                newUserData.supportSpecialties,
                                (list) => setNewUserData({ ...newUserData, supportSpecialties: list })
                              )
                            }
                            data-testid={`checkbox-specialty-${category.value}`}
                          />
                          <label
                            htmlFor={`new-${category.value}`}
                            className="text-sm font-medium leading-none cursor-pointer"
                          >
                            {category.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsCreateDialogOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700"
                      disabled={createUserMutation.isPending}
                      data-testid="button-submit-create-support"
                    >
                      {createUserMutation.isPending ? "Creando..." : "Crear Usuario"}
                    </Button>
                  </DialogFooter>
                </form>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Equipo de Soporte
          </CardTitle>
          <CardDescription>
            {supportUsers.length} usuario{supportUsers.length !== 1 ? "s" : ""} de soporte registrado
            {supportUsers.length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Cargando...</div>
          ) : supportUsers.length === 0 ? (
            <div className="text-center py-12">
              <Headset className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
              <p className="text-muted-foreground">No hay usuarios de soporte registrados</p>
              <p className="text-sm text-muted-foreground mt-1">
                Crea el primer usuario de soporte usando el botón de arriba
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Especialidades</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {supportUsers.map((supportUser) => (
                  <TableRow key={supportUser.id} data-testid={`row-support-user-${supportUser.id}`}>
                    <TableCell className="font-medium">{supportUser.username}</TableCell>
                    <TableCell>{supportUser.fullName || "-"}</TableCell>
                    <TableCell>{supportUser.email || "-"}</TableCell>
                    <TableCell>
                      {editingSpecialties === supportUser.id ? (
                        <div className="space-y-2">
                          <div className="grid grid-cols-2 gap-1.5">
                            {TICKET_CATEGORIES.map((category) => (
                              <div key={category.value} className="flex items-center space-x-1.5">
                                <Checkbox
                                  id={`edit-${supportUser.id}-${category.value}`}
                                  checked={tempSpecialties.includes(category.value)}
                                  onCheckedChange={() =>
                                    toggleSpecialty(category.value, tempSpecialties, setTempSpecialties)
                                  }
                                  className="h-3.5 w-3.5"
                                />
                                <label
                                  htmlFor={`edit-${supportUser.id}-${category.value}`}
                                  className="text-xs cursor-pointer"
                                >
                                  {category.label}
                                </label>
                              </div>
                            ))}
                          </div>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              className="h-6 text-xs bg-blue-600 hover:bg-blue-700"
                              onClick={() => saveSpecialties(supportUser.id)}
                              disabled={updateSpecialtiesMutation.isPending}
                            >
                              {updateSpecialtiesMutation.isPending ? "..." : "Guardar"}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-6 text-xs"
                              onClick={() => setEditingSpecialties(null)}
                            >
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-1 items-center">
                          {supportUser.supportSpecialties && supportUser.supportSpecialties.length > 0 ? (
                            supportUser.supportSpecialties.map((spec) => (
                              <Badge
                                key={spec}
                                variant="outline"
                                className={`text-xs ${getCategoryColor(spec)}`}
                              >
                                {getCategoryLabel(spec)}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-xs text-muted-foreground">Sin especialidades</span>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 ml-1"
                            onClick={() => startEditingSpecialties(supportUser)}
                            data-testid={`button-edit-specialties-${supportUser.id}`}
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Activo
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => setDeleteUserId(supportUser.id)}
                        data-testid={`button-delete-support-${supportUser.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-800 dark:text-blue-200">
                Información sobre el Rol de Soporte
              </h3>
              <ul className="mt-2 space-y-1 text-sm text-blue-700 dark:text-blue-300">
                <li>• Los usuarios de soporte solo pueden ver y gestionar tickets</li>
                <li>• No tienen acceso a datos de empresas, trabajadores ni otros módulos</li>
                <li>• Acceden por un portal separado: <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">/soporte/login</code></li>
                <li>• Pueden cambiar estados, asignar tickets y responder a clientes</li>
                <li>• <strong>Especialidades:</strong> Asigna categorías a cada usuario para distribuir tickets eficientemente</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteUserId} onOpenChange={() => setDeleteUserId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar usuario de soporte?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El usuario perderá acceso al sistema inmediatamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteUserId && deleteUserMutation.mutate(deleteUserId)}
            >
              {deleteUserMutation.isPending ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
