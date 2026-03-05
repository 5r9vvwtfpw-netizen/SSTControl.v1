import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Redirect } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Shield,
  Eye,
  KeyRound,
  Trash2,
  CheckCircle2,
  XCircle,
  Search,
  Users,
  FileSignature,
  Award,
  Briefcase,
  UserX,
  ChevronDown,
  ChevronUp,
  Loader2,
  Copy,
  Check,
} from "lucide-react";

interface LsoUser {
  id: string;
  fullName: string;
  email: string;
  profession: string;
  licenseNumber: string | null;
  licenseIssuer: string | null;
  licenseExpiryDate: string | null;
  licenseStatus: string | null;
  hasSignature: boolean;
  assignedCompanies: number;
}

interface LsoUserDetail extends LsoUser {
  licenseIssueDate: string | null;
  signatureUrl: string | null;
  assignments: LsoAssignment[];
}

interface LsoAssignment {
  id: string;
  companyId: string;
  companyName: string;
  assignedAt: string;
  isActive: boolean;
}

interface WorkerUser {
  id: string;
  fullName: string;
  email: string;
  companyName: string;
  createdAt: string;
  isActive: boolean;
}

interface AccessLog {
  id: string;
  userName: string;
  companyName: string;
  accessTime: string;
  ipAddress: string;
  deviceType: string;
}

interface WorkerReport {
  id: string;
  codigo: string;
  userName: string;
  reportType: string;
  subject: string;
  description: string;
  priority: string;
  status: string;
  companyName: string;
  createdAt: string;
}

function getLicenseStatusBadge(status: string | null) {
  switch (status) {
    case "vigente":
      return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Vigente</Badge>;
    case "por_vencer":
      return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">Por Vencer</Badge>;
    case "vencida":
      return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">Vencida</Badge>;
    default:
      return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">Sin Licencia</Badge>;
  }
}

function PortalLsoTab() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [resetPasswordUserId, setResetPasswordUserId] = useState<string | null>(null);
  const [resetPasswordResult, setResetPasswordResult] = useState<string | null>(null);
  const [deleteSignatureUserId, setDeleteSignatureUserId] = useState<string | null>(null);
  const [copiedPassword, setCopiedPassword] = useState(false);

  const { data: lsoUsers = [], isLoading } = useQuery<LsoUser[]>({
    queryKey: ["/api/admin/portal-lso/users"],
  });

  const { data: lsoUserDetail, isLoading: isLoadingDetail } = useQuery<LsoUserDetail>({
    queryKey: ["/api/admin/portal-lso/users", selectedUserId],
    enabled: !!selectedUserId && showDetailDialog,
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await apiRequest("POST", `/api/admin/portal-lso/users/${userId}/reset-password`);
      return res.json();
    },
    onSuccess: (data: { temporaryPassword: string }) => {
      setResetPasswordResult(data.temporaryPassword);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/portal-lso/users"] });
      toast({ title: "Contrasena restablecida", description: "Se genero una contrasena temporal exitosamente." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteSignatureMutation = useMutation({
    mutationFn: async (userId: string) => {
      await apiRequest("DELETE", `/api/admin/portal-lso/users/${userId}/signature`);
    },
    onSuccess: () => {
      setDeleteSignatureUserId(null);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/portal-lso/users"] });
      toast({ title: "Firma eliminada", description: "La firma del LSO ha sido eliminada exitosamente." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deactivateAssignmentMutation = useMutation({
    mutationFn: async (assignmentId: string) => {
      await apiRequest("DELETE", `/api/admin/portal-lso/assignments/${assignmentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/portal-lso/users", selectedUserId] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/portal-lso/users"] });
      toast({ title: "Asignacion desactivada", description: "La asignacion ha sido desactivada." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const filteredUsers = lsoUsers.filter(
    (u) =>
      u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalLsos = lsoUsers.length;
  const withSignature = lsoUsers.filter((u) => u.hasSignature).length;
  const activeLicense = lsoUsers.filter((u) => u.licenseStatus === "vigente").length;
  const activeAssignments = lsoUsers.reduce((sum, u) => sum + u.assignedCompanies, 0);

  const copyPassword = async (pw: string) => {
    await navigator.clipboard.writeText(pw);
    setCopiedPassword(true);
    setTimeout(() => setCopiedPassword(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total LSOs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-stat-total-lsos">{totalLsos}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Con Firma</CardTitle>
            <FileSignature className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-stat-with-signature">{withSignature}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Licencia Vigente</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-stat-active-license">{activeLicense}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Asignaciones Activas</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-stat-active-assignments">{activeAssignments}</div>
          </CardContent>
        </Card>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre o email..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          data-testid="input-search-lso"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Licencia</TableHead>
                <TableHead>Estado Licencia</TableHead>
                <TableHead>Firma</TableHead>
                <TableHead>Empresas Asignadas</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No se encontraron usuarios LSO
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id} data-testid={`row-lso-user-${user.id}`}>
                    <TableCell className="font-medium">{user.fullName}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.licenseNumber || "-"}</TableCell>
                    <TableCell>{getLicenseStatusBadge(user.licenseStatus)}</TableCell>
                    <TableCell>
                      {user.hasSignature ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                    </TableCell>
                    <TableCell>{user.assignedCompanies}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => {
                            setSelectedUserId(user.id);
                            setShowDetailDialog(true);
                          }}
                          data-testid={`button-detail-lso-${user.id}`}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => {
                            setResetPasswordUserId(user.id);
                            setResetPasswordResult(null);
                          }}
                          data-testid={`button-reset-password-lso-${user.id}`}
                        >
                          <KeyRound className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setDeleteSignatureUserId(user.id)}
                          disabled={!user.hasSignature}
                          data-testid={`button-delete-signature-${user.id}`}
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
        </CardContent>
      </Card>

      <Dialog open={showDetailDialog} onOpenChange={(open) => {
        if (!open) {
          setShowDetailDialog(false);
          setSelectedUserId(null);
        }
      }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalle del LSO</DialogTitle>
            <DialogDescription>Informacion completa del profesional licenciado</DialogDescription>
          </DialogHeader>
          {isLoadingDetail ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : lsoUserDetail ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground text-xs">Nombre</Label>
                  <p className="font-medium" data-testid="text-detail-name">{lsoUserDetail.fullName}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Email</Label>
                  <p className="font-medium" data-testid="text-detail-email">{lsoUserDetail.email}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Profesion</Label>
                  <p className="font-medium">{lsoUserDetail.profession || "-"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">No. Licencia</Label>
                  <p className="font-medium">{lsoUserDetail.licenseNumber || "-"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Expedidor</Label>
                  <p className="font-medium">{lsoUserDetail.licenseIssuer || "-"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Fecha Expedicion</Label>
                  <p className="font-medium">{lsoUserDetail.licenseIssueDate || "-"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Fecha Vencimiento</Label>
                  <p className="font-medium">{lsoUserDetail.licenseExpiryDate || "-"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Estado Licencia</Label>
                  <div className="mt-1">{getLicenseStatusBadge(lsoUserDetail.licenseStatus)}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Firma</Label>
                  <div className="mt-1 flex items-center gap-2">
                    {lsoUserDetail.hasSignature ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span className="text-sm">Registrada</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 text-red-500" />
                        <span className="text-sm">Sin firma</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {lsoUserDetail.assignments && lsoUserDetail.assignments.length > 0 && (
                <div>
                  <Label className="text-muted-foreground text-xs">Empresas Asignadas</Label>
                  <div className="mt-2 space-y-2">
                    {lsoUserDetail.assignments.map((assignment) => (
                      <div
                        key={assignment.id}
                        className="flex items-center justify-between gap-2 rounded-md border p-2"
                        data-testid={`assignment-${assignment.id}`}
                      >
                        <div>
                          <p className="text-sm font-medium">{assignment.companyName}</p>
                          <p className="text-xs text-muted-foreground">
                            Asignado: {assignment.assignedAt}
                          </p>
                        </div>
                        {assignment.isActive && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deactivateAssignmentMutation.mutate(assignment.id)}
                            disabled={deactivateAssignmentMutation.isPending}
                            data-testid={`button-deactivate-assignment-${assignment.id}`}
                          >
                            Desactivar
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailDialog(false)} data-testid="button-close-detail">
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!resetPasswordUserId} onOpenChange={(open) => {
        if (!open) {
          setResetPasswordUserId(null);
          setResetPasswordResult(null);
          setCopiedPassword(false);
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Restablecer Contrasena</DialogTitle>
            <DialogDescription>
              {resetPasswordResult
                ? "La contrasena temporal ha sido generada exitosamente."
                : "Se generara una contrasena temporal para este usuario LSO."}
            </DialogDescription>
          </DialogHeader>
          {resetPasswordResult ? (
            <div className="space-y-3">
              <Label>Contrasena Temporal</Label>
              <div className="flex gap-2">
                <Input value={resetPasswordResult} readOnly className="bg-muted font-mono" data-testid="input-temp-password-lso" />
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => copyPassword(resetPasswordResult)}
                  data-testid="button-copy-password-lso"
                >
                  {copiedPassword ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Comparta esta contrasena con el usuario. Debera cambiarla en su proximo inicio de sesion.
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Esta accion no se puede deshacer. El usuario debera usar la nueva contrasena temporal.
            </p>
          )}
          <DialogFooter>
            {resetPasswordResult ? (
              <Button onClick={() => { setResetPasswordUserId(null); setResetPasswordResult(null); setCopiedPassword(false); }} data-testid="button-close-reset-lso">
                Cerrar
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={() => setResetPasswordUserId(null)} data-testid="button-cancel-reset-lso">
                  Cancelar
                </Button>
                <Button
                  onClick={() => resetPasswordUserId && resetPasswordMutation.mutate(resetPasswordUserId)}
                  disabled={resetPasswordMutation.isPending}
                  data-testid="button-confirm-reset-lso"
                >
                  {resetPasswordMutation.isPending ? "Procesando..." : "Restablecer"}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteSignatureUserId} onOpenChange={(open) => { if (!open) setDeleteSignatureUserId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Firma</AlertDialogTitle>
            <AlertDialogDescription>
              Esta accion eliminara la firma digital del LSO. El usuario debera registrar una nueva firma. Esta accion no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete-signature">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteSignatureUserId && deleteSignatureMutation.mutate(deleteSignatureUserId)}
              data-testid="button-confirm-delete-signature"
            >
              {deleteSignatureMutation.isPending ? "Eliminando..." : "Eliminar Firma"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function PortalEmpleadosTab() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [resetPasswordUserId, setResetPasswordUserId] = useState<string | null>(null);
  const [resetPasswordResult, setResetPasswordResult] = useState<string | null>(null);
  const [deactivateUserId, setDeactivateUserId] = useState<string | null>(null);
  const [showAccessLogs, setShowAccessLogs] = useState(false);
  const [showReports, setShowReports] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);

  const { data: workerUsers = [], isLoading } = useQuery<WorkerUser[]>({
    queryKey: ["/api/admin/portal-empleados/users"],
  });

  const { data: accessLogs = [] } = useQuery<AccessLog[]>({
    queryKey: ["/api/admin/portal-empleados/access-logs"],
    enabled: showAccessLogs,
  });

  const { data: workerReports = [] } = useQuery<WorkerReport[]>({
    queryKey: ["/api/admin/portal-empleados/reports"],
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await apiRequest("POST", `/api/admin/portal-empleados/users/${userId}/reset-password`);
      return res.json();
    },
    onSuccess: (data: { temporaryPassword: string }) => {
      setResetPasswordResult(data.temporaryPassword);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/portal-empleados/users"] });
      toast({ title: "Contrasena restablecida", description: "Se genero una contrasena temporal exitosamente." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deactivateUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      await apiRequest("PATCH", `/api/admin/portal-empleados/users/${userId}/deactivate`);
    },
    onSuccess: () => {
      setDeactivateUserId(null);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/portal-empleados/users"] });
      toast({ title: "Usuario desactivado", description: "El acceso del trabajador ha sido desactivado." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteReportMutation = useMutation({
    mutationFn: async (reportId: string) => {
      await apiRequest("DELETE", `/api/admin/portal-empleados/reports/${reportId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/portal-empleados/reports"] });
      toast({ title: "Reporte eliminado", description: "El reporte ha sido eliminado exitosamente." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const filteredUsers = workerUsers.filter(
    (u) =>
      u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalWorkers = workerUsers.length;
  const withAccess = workerUsers.filter((u) => u.isActive).length;
  const pendingReports = workerReports.length;

  const copyPassword = async (pw: string) => {
    await navigator.clipboard.writeText(pw);
    setCopiedPassword(true);
    setTimeout(() => setCopiedPassword(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Trabajadores</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-stat-total-workers">{totalWorkers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Con Acceso Portal</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-stat-with-access">{withAccess}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reportes Pendientes</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-stat-pending-reports">{pendingReports}</div>
          </CardContent>
        </Card>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre o email..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          data-testid="input-search-workers"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Fecha Creacion</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No se encontraron trabajadores
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((worker) => (
                  <TableRow key={worker.id} data-testid={`row-worker-${worker.id}`}>
                    <TableCell className="font-medium">{worker.fullName}</TableCell>
                    <TableCell>{worker.email}</TableCell>
                    <TableCell>{worker.companyName}</TableCell>
                    <TableCell>{worker.createdAt}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => {
                            setResetPasswordUserId(worker.id);
                            setResetPasswordResult(null);
                          }}
                          data-testid={`button-reset-password-worker-${worker.id}`}
                        >
                          <KeyRound className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setDeactivateUserId(worker.id)}
                          disabled={!worker.isActive}
                          data-testid={`button-deactivate-worker-${worker.id}`}
                        >
                          <UserX className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div
          className="flex items-center justify-between gap-2 cursor-pointer rounded-md border p-3"
          onClick={() => setShowAccessLogs(!showAccessLogs)}
          data-testid="button-toggle-access-logs"
        >
          <span className="font-medium">Logs de Acceso</span>
          {showAccessLogs ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
        {showAccessLogs && (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Dispositivo</TableHead>
                    <TableHead>IP</TableHead>
                    <TableHead>Fecha Acceso</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accessLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                        No hay logs de acceso recientes
                      </TableCell>
                    </TableRow>
                  ) : (
                    accessLogs.map((log) => (
                      <TableRow key={log.id} data-testid={`row-access-log-${log.id}`}>
                        <TableCell className="font-medium">{log.userName}</TableCell>
                        <TableCell>{log.companyName}</TableCell>
                        <TableCell>{log.deviceType}</TableCell>
                        <TableCell className="font-mono text-sm">{log.ipAddress}</TableCell>
                        <TableCell>{log.accessTime}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        <div
          className="flex items-center justify-between gap-2 cursor-pointer rounded-md border p-3"
          onClick={() => setShowReports(!showReports)}
          data-testid="button-toggle-reports"
        >
          <span className="font-medium">Reportes de Trabajadores</span>
          {showReports ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
        {showReports && (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Codigo</TableHead>
                    <TableHead>Reportante</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Asunto</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {workerReports.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                        No hay reportes de trabajadores
                      </TableCell>
                    </TableRow>
                  ) : (
                    workerReports.map((report) => (
                      <TableRow key={report.id} data-testid={`row-report-${report.id}`}>
                        <TableCell className="font-mono text-sm">{report.codigo}</TableCell>
                        <TableCell>{report.userName}</TableCell>
                        <TableCell>{report.reportType}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{report.subject}</TableCell>
                        <TableCell>
                          <Badge className={
                            report.status === "resuelto" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" :
                            report.status === "en_proceso" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300" :
                            "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                          }>
                            {report.status === "pendiente" ? "Pendiente" : report.status === "en_proceso" ? "En Proceso" : report.status === "resuelto" ? "Resuelto" : report.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{report.companyName}</TableCell>
                        <TableCell>{report.createdAt}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => deleteReportMutation.mutate(report.id)}
                            disabled={deleteReportMutation.isPending}
                            data-testid={`button-delete-report-${report.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={!!resetPasswordUserId} onOpenChange={(open) => {
        if (!open) {
          setResetPasswordUserId(null);
          setResetPasswordResult(null);
          setCopiedPassword(false);
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Restablecer Contrasena</DialogTitle>
            <DialogDescription>
              {resetPasswordResult
                ? "La contrasena temporal ha sido generada exitosamente."
                : "Se generara una contrasena temporal para este trabajador."}
            </DialogDescription>
          </DialogHeader>
          {resetPasswordResult ? (
            <div className="space-y-3">
              <Label>Contrasena Temporal</Label>
              <div className="flex gap-2">
                <Input value={resetPasswordResult} readOnly className="bg-muted font-mono" data-testid="input-temp-password-worker" />
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => copyPassword(resetPasswordResult)}
                  data-testid="button-copy-password-worker"
                >
                  {copiedPassword ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Comparta esta contrasena con el trabajador. Debera cambiarla en su proximo inicio de sesion.
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Esta accion no se puede deshacer. El trabajador debera usar la nueva contrasena temporal.
            </p>
          )}
          <DialogFooter>
            {resetPasswordResult ? (
              <Button onClick={() => { setResetPasswordUserId(null); setResetPasswordResult(null); setCopiedPassword(false); }} data-testid="button-close-reset-worker">
                Cerrar
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={() => setResetPasswordUserId(null)} data-testid="button-cancel-reset-worker">
                  Cancelar
                </Button>
                <Button
                  onClick={() => resetPasswordUserId && resetPasswordMutation.mutate(resetPasswordUserId)}
                  disabled={resetPasswordMutation.isPending}
                  data-testid="button-confirm-reset-worker"
                >
                  {resetPasswordMutation.isPending ? "Procesando..." : "Restablecer"}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deactivateUserId} onOpenChange={(open) => { if (!open) setDeactivateUserId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Desactivar Usuario</AlertDialogTitle>
            <AlertDialogDescription>
              Esta accion desactivara el acceso del trabajador al portal de empleados. El usuario no podra iniciar sesion hasta que se reactive su cuenta.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-deactivate">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deactivateUserId && deactivateUserMutation.mutate(deactivateUserId)}
              data-testid="button-confirm-deactivate"
            >
              {deactivateUserMutation.isPending ? "Desactivando..." : "Desactivar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function AdminPortales() {
  const { user } = useAuth();

  if (!user || user.role !== "superadmin") {
    return <Redirect to="/" />;
  }

  return (
    <div className="space-y-6" data-testid="page-admin-portales">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2" data-testid="text-page-title">
          <Shield className="h-6 w-6" />
          Administracion de Portales
        </h1>
        <p className="text-muted-foreground mt-1">
          Gestione usuarios y datos de los portales LSO y Empleados
        </p>
      </div>

      <Tabs defaultValue="portal-lso">
        <TabsList>
          <TabsTrigger value="portal-lso" data-testid="tab-portal-lso">Portal LSO</TabsTrigger>
          <TabsTrigger value="portal-empleados" data-testid="tab-portal-empleados">Portal Empleados</TabsTrigger>
        </TabsList>
        <TabsContent value="portal-lso" className="mt-6">
          <PortalLsoTab />
        </TabsContent>
        <TabsContent value="portal-empleados" className="mt-6">
          <PortalEmpleadosTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}